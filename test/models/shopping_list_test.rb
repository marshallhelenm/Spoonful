require "test_helper"

class ShoppingListTest < ActiveSupport::TestCase
  setup do
    @plan = MealPlan.create!(spoon_budget: 10)
    recipes(:pasta).save_with_ingredients([ { name: "Spaghetti", amount: "1 lb" }, { name: "Onion", amount: "half" } ])
    # chili (fixtures): Kidney beans "2 cans", Onion "1"
  end

  def plan_recipes(*recipe_names)
    recipe_names.each_with_index { |name, position| @plan.entries.create!(recipe: recipes(name), position: position) }
  end

  test "combines ingredients across recipes, listing each recipe's amount" do
    plan_recipes(:chili, :pasta)

    onion = @plan.shopping_list.items.find { it.name == "Onion" }
    assert_equal [
      ShoppingList::Use.new(recipe_name: "Big Pot Chili", amount: "1", times: 1),
      ShoppingList::Use.new(recipe_name: "Weeknight Pasta", amount: "half", times: 1)
    ], onion.uses
  end

  test "items are alphabetical with checked ones last" do
    plan_recipes(:chili, :pasta)
    @plan.shopping_list_checks.create!(ingredient: ingredients(:kidney_beans))

    items = @plan.shopping_list.items
    assert_equal [ "Onion", "Spaghetti", "Kidney beans" ], items.map(&:name)
    assert_equal [ false, false, true ], items.map(&:checked)
  end

  test "a recipe planned twice counts its amounts twice" do
    plan_recipes(:pasta, :pasta)
    spaghetti = @plan.shopping_list.items.find { it.name == "Spaghetti" }
    assert_equal [ ShoppingList::Use.new(recipe_name: "Weeknight Pasta", amount: "1 lb", times: 2) ], spaghetti.uses
  end

  test "lists planned recipes that have no ingredients yet, ignoring 0-spoon fillers" do
    plan_recipes(:chili, :takeout)
    Recipe.create!(name: "Soup", spoons: 2).tap { @plan.entries.create!(recipe: it, position: 5) }

    assert_equal [ "Soup" ], @plan.shopping_list.recipes_without_ingredients.map(&:name)
  end

  test "an empty plan has an empty list" do
    assert_empty @plan.shopping_list.items
  end
end
