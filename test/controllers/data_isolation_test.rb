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

  test "new plans only use your own recipes" do
    post meal_plans_path, params: { meal_plan: { spoon_budget: 20, meal_count: 14 } }

    plan = users(:one).meal_plans.order(:created_at).last
    assert_not_includes plan.recipes, recipes(:secret_soup)
  end

  test "the same recipe name can exist in two accounts" do
    post recipes_path, params: { recipe: { name: "Secret Soup", spoons: 1, meals_covered: 1 } }
    assert_redirected_to recipes_path
  end
end
