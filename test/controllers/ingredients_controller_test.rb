require "test_helper"

class IngredientsControllerTest < ActionDispatch::IntegrationTest
  test "index lists ingredients alphabetically with the recipes that use them" do
    get ingredients_path

    assert_inertia_component "ingredients/index"
    ingredients = inertia.props[:ingredients]
    assert_equal [ "Kidney beans", "Onion", "Tomato" ], ingredients.map { it[:name] }
    assert_equal [ "Big Pot Chili" ], ingredients.first[:recipes].map { it[:name] }
    assert_empty ingredients.last[:recipes]
  end

  test "update renames an ingredient" do
    patch ingredient_path(ingredients(:tomato)), params: { ingredient: { name: "Roma tomato" } }

    assert_redirected_to ingredients_path
    assert_equal "Roma tomato", ingredients(:tomato).reload.name
  end

  test "update allows changing just the capitalization" do
    patch ingredient_path(ingredients(:onion)), params: { ingredient: { name: "ONION" } }
    assert_equal "ONION", ingredients(:onion).reload.name
  end

  test "renaming to an existing ingredient suggests merging" do
    patch ingredient_path(ingredients(:tomato)), params: { ingredient: { name: "onion" } }

    assert_redirected_to ingredients_path
    follow_redirect!
    assert_equal "There's already an ingredient called Onion. Use “Merge into” to combine them.",
                 inertia.props[:errors][:name].first
    assert_equal "Tomato", ingredients(:tomato).reload.name
  end

  test "merge folds one ingredient into another" do
    post merge_ingredient_path(ingredients(:kidney_beans)), params: { target_id: ingredients(:tomato).id }

    assert_redirected_to ingredients_path
    assert_not Ingredient.exists?(ingredients(:kidney_beans).id)
    assert_includes recipes(:chili).reload.ingredients, ingredients(:tomato)
    assert_equal "Merged Kidney beans into Tomato.", flash[:notice]
  end

  test "merge into itself is refused" do
    post merge_ingredient_path(ingredients(:onion)), params: { target_id: ingredients(:onion).id }

    assert_redirected_to ingredients_path
    assert Ingredient.exists?(ingredients(:onion).id)
    assert flash[:alert].present?
  end

  test "destroy deletes an unused ingredient" do
    assert_difference -> { Ingredient.count }, -1 do
      delete ingredient_path(ingredients(:tomato))
    end
  end

  test "destroy refuses an ingredient a recipe uses" do
    assert_no_difference -> { Ingredient.count } do
      delete ingredient_path(ingredients(:onion))
    end
    assert_match "Merge it into another ingredient", flash[:alert]
  end
end
