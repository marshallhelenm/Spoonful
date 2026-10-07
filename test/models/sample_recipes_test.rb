require "test_helper"

class SampleRecipesTest < ActiveSupport::TestCase
  test "adds the sample recipes and ingredient lists to an account" do
    user = users(:two)

    added = SampleRecipes.add_to(user)

    assert_equal SampleRecipes::RECIPES.size, added
    assert_equal 6, user.recipes.find_by!(name: "Big pot chili").recipe_ingredients.count
    assert user.ingredients.exists?(name: "Garlic")
  end

  test "running it twice adds nothing new" do
    user = users(:two)
    SampleRecipes.add_to(user)

    assert_no_difference [ "Recipe.count", "Ingredient.count", "RecipeIngredient.count" ] do
      assert_equal 0, SampleRecipes.add_to(user)
    end
  end

  test "leaves the user's own recipes alone, even with a matching name" do
    user = users(:two)
    user.recipes.create!(name: "big pot chili", spoons: 5, meals_covered: 1)

    SampleRecipes.add_to(user)

    assert_equal 5, user.recipes.find_by!(name: "big pot chili").spoons
    assert_not user.recipes.exists?(name: "Big pot chili")
  end
end
