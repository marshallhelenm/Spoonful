require "test_helper"

class RecipesControllerTest < ActionDispatch::IntegrationTest
  test "index lists recipes alphabetically with when each was last planned" do
    get recipes_path

    assert_inertia_component "recipes/index"
    recipes = inertia.props[:recipes]
    assert_equal [ "Big Pot Chili", "Takeout", "Weeknight Pasta" ], recipes.map { it[:name] }
    assert_equal "2026-09-28", recipes.first[:last_made_on].to_s
    assert_nil recipes.last[:last_made_on]
  end

  test "create saves a valid recipe" do
    assert_difference -> { Recipe.count } do
      post recipes_path, params: { recipe: { name: "Lentil Soup", spoons: 2, meals_covered: 3 } }
    end
    assert_redirected_to recipes_path
    assert_equal 3, Recipe.find_by!(name: "Lentil Soup").meals_covered
  end

  test "create saves ingredient lines" do
    post recipes_path, params: { recipe: {
      name: "Salsa", spoons: 1, meals_covered: 2,
      ingredients: [ { name: "tomato", amount: "4" }, { name: "Lime", amount: "" } ]
    } }

    assert_redirected_to recipes_path
    assert_equal [ { name: "Tomato", amount: "4" }, { name: "Lime", amount: nil } ],
                 Recipe.find_by!(name: "Salsa").ingredient_lines
  end

  test "update with an empty ingredient list clears it" do
    patch recipe_path(recipes(:chili)), params: { recipe: { name: "Big Pot Chili", ingredients: [] } },
                                        as: :json
    assert_empty recipes(:chili).reload.recipe_ingredients
  end

  test "update without ingredients leaves them alone" do
    patch recipe_path(recipes(:chili)), params: { recipe: { spoons: 4 } }
    assert_equal 2, recipes(:chili).reload.recipe_ingredients.count
  end

  test "edit includes the recipe's ingredients and all ingredient names for suggestions" do
    get edit_recipe_path(recipes(:chili))

    assert_inertia_component "recipes/edit"
    assert_equal [ { "name" => "Kidney beans", "amount" => "2 cans" }, { "name" => "Onion", "amount" => "1" } ],
                 inertia.props[:recipe][:ingredients].map(&:to_h)
    assert_equal [ "Kidney beans", "Onion", "Tomato" ], inertia.props[:ingredient_names]
  end

  test "index includes each recipe's ingredient count" do
    get recipes_path
    counts = inertia.props[:recipes].to_h { [ it[:name], it[:ingredient_count] ] }
    assert_equal 2, counts["Big Pot Chili"]
    assert_equal 0, counts["Weeknight Pasta"]
  end

  test "create with invalid data redirects back with errors" do
    assert_no_difference -> { Recipe.count } do
      post recipes_path, params: { recipe: { name: "", spoons: 9 } }
    end
    assert_redirected_to new_recipe_path
    follow_redirect!
    assert inertia.props[:errors][:name].present?
    assert inertia.props[:errors][:spoons].present?
  end

  test "update changes a recipe" do
    patch recipe_path(recipes(:pasta)), params: { recipe: { spoons: 1 } }
    assert_redirected_to recipes_path
    assert_equal 1, recipes(:pasta).reload.spoons
  end

  test "destroy deletes an unplanned recipe" do
    assert_difference -> { Recipe.count }, -1 do
      delete recipe_path(recipes(:pasta))
    end
    assert_redirected_to recipes_path
  end

  test "destroy refuses a recipe that's in a saved plan" do
    assert_no_difference -> { Recipe.count } do
      delete recipe_path(recipes(:chili))
    end
    assert_redirected_to edit_recipe_path(recipes(:chili))
    assert_match "can't be deleted", flash[:alert]
  end
end
