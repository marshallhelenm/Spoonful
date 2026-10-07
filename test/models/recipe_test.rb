require "test_helper"

class RecipeTest < ActiveSupport::TestCase
  def build_recipe(**attrs)
    users(:one).recipes.new(name: "Soup", spoons: 2, meals_covered: 1, **attrs)
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

  test "named finds a recipe ignoring case and spacing" do
    assert_equal [ recipes(:chili) ], users(:one).recipes.named("  big POT   chili ").to_a
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

  test "a missing spoon rating gets a friendly message" do
    recipe = build_recipe(spoons: nil)
    assert_not recipe.valid?
    assert_equal [ "needs a rating" ], recipe.errors[:spoons]
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

  test "save_with_ingredients saves lines in order, reusing existing ingredients" do
    recipe = build_recipe(name: "Salsa")

    assert_difference -> { Ingredient.count }, 1 do # only Cilantro is new
      assert recipe.save_with_ingredients([
        { name: "tomato", amount: "4" },
        { name: "Cilantro", amount: "" },
        { name: "  ", amount: "ignored" },
        { name: "ONION", amount: "half" }
      ])
    end

    assert_equal(
      [ { name: "Tomato", amount: "4" }, { name: "Cilantro", amount: nil }, { name: "Onion", amount: "half" } ],
      recipe.ingredient_lines
    )
  end

  test "save_with_ingredients replaces the existing list" do
    chili = recipes(:chili)
    assert chili.save_with_ingredients([ { name: "Tomato", amount: "1 can" } ])
    assert_equal [ { name: "Tomato", amount: "1 can" } ], chili.ingredient_lines
  end

  test "save_with_ingredients with nil leaves the ingredients alone" do
    chili = recipes(:chili)
    chili.spoons = 4
    assert chili.save_with_ingredients(nil)
    assert_equal [ "Kidney beans", "Onion" ], chili.reload.ingredient_lines.map { it[:name] }
  end

  test "save_with_ingredients saves nothing when the recipe is invalid" do
    recipe = build_recipe(name: "")
    assert_no_difference [ "Recipe.count", "Ingredient.count", "RecipeIngredient.count" ] do
      assert_not recipe.save_with_ingredients([ { name: "Brand new thing", amount: nil } ])
    end
  end

  test "deleting a recipe removes its ingredient lines but keeps the ingredients" do
    pasta = recipes(:pasta)
    pasta.save_with_ingredients([ { name: "Tomato", amount: nil } ])

    assert_difference -> { RecipeIngredient.count }, -1 do
      pasta.destroy
    end
    assert Ingredient.exists?(ingredients(:tomato).id)
  end

  test "database rejects out-of-range spoons even if validations are skipped" do
    recipe = build_recipe(spoons: 9)
    assert_raises(ActiveRecord::StatementInvalid) { recipe.save!(validate: false) }
  end
end
