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
