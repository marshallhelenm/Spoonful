require "test_helper"

# Signed in as user one, none of user two's data can be seen or changed.
class DataIsolationTest < ActionDispatch::IntegrationTest
  setup { sign_in_as(users(:one)) }

  test "lists only show your own recipes, plans, and ingredients" do
    get recipes_path
    assert_not_includes inertia.props[:recipes].map { it[:name] }, "Secret Soup"

    get meal_plans_path
    assert_equal [ meal_plans(:last_week).id ], inertia.props[:meal_plans].map { it[:id] }

    get ingredients_path
    assert_not_includes inertia.props[:ingredients].map { it[:name] }, "Secret spice"

    get new_recipe_path
    assert_not_includes inertia.props[:ingredient_names], "Secret spice"
  end

  test "someone else's recipe can't be viewed, edited, or deleted" do
    soup = recipes(:secret_soup)

    get edit_recipe_path(soup)
    assert_response :not_found

    patch recipe_path(soup), params: { recipe: { name: "Mine now" } }
    assert_response :not_found

    patch recipe_plan_inclusion_path(soup), params: { included: false }
    assert_response :not_found
    assert soup.reload.include_in_plans

    delete recipe_path(soup)
    assert_response :not_found
    assert_equal "Secret Soup", soup.reload.name
  end

  test "someone else's plan and shopping list can't be opened" do
    plan = meal_plans(:someone_elses_week)

    get meal_plan_path(plan)
    assert_response :not_found

    get meal_plan_shopping_list_path(plan)
    assert_response :not_found
  end

  test "someone else's recipe can't be swapped into your plan" do
    entry = meal_plan_entries(:last_week_chili)

    patch meal_plan_entry_path(meal_plans(:last_week), entry),
          params: { meal_plan_entry: { recipe_id: recipes(:secret_soup).id } }

    assert_response :not_found
    assert_equal recipes(:chili), entry.reload.recipe
  end

  test "you can't merge into someone else's ingredient" do
    post merge_ingredient_path(ingredients(:onion)), params: { target_id: ingredients(:secret_spice).id }

    assert_response :not_found
    assert Ingredient.exists?(ingredients(:onion).id)
  end

  test "someone else's plan can't be reshuffled or deleted" do
    plan = meal_plans(:someone_elses_week)

    post reshuffle_meal_plan_path(plan)
    assert_response :not_found

    delete meal_plan_path(plan)
    assert_response :not_found
    assert MealPlan.exists?(plan.id)
  end

  test "meals in someone else's plan can't be swapped, shuffled, or removed" do
    plan = meal_plans(:someone_elses_week)
    entry = meal_plan_entries(:someone_elses_soup)

    patch meal_plan_entry_path(plan, entry), params: { meal_plan_entry: { recipe_id: recipes(:chili).id } }
    assert_response :not_found

    post shuffle_meal_plan_entry_path(plan, entry)
    assert_response :not_found

    delete meal_plan_entry_path(plan, entry)
    assert_response :not_found
    assert_equal recipes(:secret_soup), entry.reload.recipe
  end

  test "someone else's shopping list can't be checked off" do
    check_off = ->(plan, ingredient) do
      patch meal_plan_shopping_list_item_path(plan, ingredient), params: { checked: true }
    end

    # Their plan, your ingredient
    check_off.(meal_plans(:someone_elses_week), ingredients(:onion))
    assert_response :not_found

    # Your plan, their ingredient
    check_off.(meal_plans(:last_week), ingredients(:secret_spice))
    assert_response :not_found

    assert_equal 0, ShoppingListCheck.count
  end

  test "someone else's ingredient can't be renamed, deleted, or merged away" do
    spice = ingredients(:secret_spice)

    patch ingredient_path(spice), params: { ingredient: { name: "Mine now" } }
    assert_response :not_found

    delete ingredient_path(spice)
    assert_response :not_found

    post merge_ingredient_path(spice), params: { target_id: ingredients(:onion).id }
    assert_response :not_found

    assert_equal "Secret spice", spice.reload.name
  end

  test "new plans only use your own recipes" do
    post meal_plans_path, params: { meal_plan: { spoon_budget: 20, meal_count: 7 } }

    plan = users(:one).meal_plans.order(:created_at).last
    assert_not_includes plan.recipes, recipes(:secret_soup)
  end

  test "the same recipe name can exist in two accounts" do
    post recipes_path, params: { recipe: { name: "Secret Soup", spoons: 1, meals_covered: 1 } }
    assert_redirected_to recipes_path
  end
end
