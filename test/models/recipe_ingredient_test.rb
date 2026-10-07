require "test_helper"

class RecipeIngredientTest < ActiveSupport::TestCase
  test "blank amounts are stored as nil" do
    line = RecipeIngredient.new(amount: "   ")
    assert_nil line.amount
  end

  test "position must be unique within a recipe" do
    line = recipes(:chili).recipe_ingredients.build(ingredient: ingredients(:tomato), position: 0)
    assert_not line.valid?
  end

  test "can't use another user's ingredient" do
    line = recipes(:chili).recipe_ingredients.build(ingredient: ingredients(:secret_spice), position: 9)
    assert_not line.valid?
    assert_includes line.errors[:ingredient], "must be one of your ingredients"
  end
end
