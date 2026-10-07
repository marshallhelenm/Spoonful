require "test_helper"

class RecipeTest < ActiveSupport::TestCase
  def build_recipe(**attrs)
    Recipe.new(name: "Soup", spoons: 2, meals_covered: 1, **attrs)
  end

  test "valid with name, spoons, and meals covered" do
    assert build_recipe.valid?
  end

  test "meals covered defaults to 1" do
    assert_equal 1, Recipe.new.meals_covered
  end

  test "requires a name" do
    recipe = build_recipe(name: "  ")
    assert_not recipe.valid?
    assert_includes recipe.errors[:name], "can't be blank"
  end

  test "squishes whitespace in the name" do
    assert_equal "Lentil Soup", build_recipe(name: "  Lentil   Soup ").name
  end

  test "names are unique regardless of case" do
    recipe = build_recipe(name: "big pot chili")
    assert_not recipe.valid?
    assert_includes recipe.errors[:name], "has already been taken"
  end

  test "spoons must be between 0 and 5" do
    assert build_recipe(spoons: 0).valid?
    assert build_recipe(spoons: 5).valid?
    assert_not build_recipe(spoons: -1).valid?
    assert_not build_recipe(spoons: 6).valid?
    assert_not build_recipe(spoons: nil).valid?
  end

  test "spoons must be a whole number" do
    assert_not build_recipe(spoons: 2.5).valid?
  end

  test "meals covered must be at least 1" do
    assert_not build_recipe(meals_covered: 0).valid?
    assert build_recipe(meals_covered: 4).valid?
  end

  test "zero-spoon recipes are fillers" do
    assert recipes(:takeout).filler?
    assert_not recipes(:pasta).filler?
  end

  test "database rejects out-of-range spoons even if validations are skipped" do
    recipe = build_recipe(spoons: 9)
    assert_raises(ActiveRecord::StatementInvalid) { recipe.save!(validate: false) }
  end
end
