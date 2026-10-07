require "test_helper"

class MealPlannerTest < ActiveSupport::TestCase
  TODAY = Date.new(2026, 10, 5)

  # Unsaved recipes with ids: the planner never touches the database.
  def recipe(id, spoons, meals_covered = 1)
    Recipe.new(id: id, name: "Recipe #{id}", spoons: spoons, meals_covered: meals_covered)
  end

  def plan(recipes, meal_count:, spoon_budget:, max_spoons: nil, last_made_on: {}, seed: 1)
    MealPlanner.new(recipes: recipes, meal_count: meal_count, spoon_budget: spoon_budget, max_spoons: max_spoons,
                    last_made_on: last_made_on, today: TODAY, random: Random.new(seed)).call
  end

  def varied_recipes
    [
      recipe(1, 3, 2), recipe(2, 2), recipe(3, 4, 3), recipe(4, 1),
      recipe(5, 5, 2), recipe(6, 2, 2), recipe(7, 3), recipe(8, 0) # 8 is a filler
    ]
  end

  test "hits the spoon budget and fills every meal when the recipes allow it" do
    [ 1, 2, 3, 4, 5 ].each do |seed|
      result = plan(varied_recipes, meal_count: 14, spoon_budget: 12, seed: seed)
      assert_equal 12, result.total_spoons, "seed #{seed}"
      assert_operator result.meals_planned, :>=, 14, "seed #{seed}"
    end
  end

  test "a low budget is met by leaning on 0-spoon fillers" do
    result = plan(varied_recipes, meal_count: 14, spoon_budget: 0)
    assert_equal 0, result.total_spoons
    assert_operator result.meals_planned, :>=, 14
  end

  test "a high budget can go over a little when it can't be hit exactly" do
    result = plan([ recipe(1, 5), recipe(2, 5) ], meal_count: 2, spoon_budget: 9)
    assert_equal 10, result.total_spoons
  end

  test "a spoon cap excludes harder recipes, even when they'd fit the budget" do
    [ 1, 2, 3, 4, 5 ].each do |seed|
      result = plan(varied_recipes, meal_count: 14, spoon_budget: 20, max_spoons: 2, seed: seed)
      assert result.recipes.any?, "seed #{seed}"
      assert result.recipes.all? { it.spoons <= 2 }, "seed #{seed}"
    end
  end

  test "without a cap, one hard recipe can still land in a low budget" do
    result = plan([ recipe(1, 5), recipe(2, 0) ], meal_count: 3, spoon_budget: 5)
    assert_includes result.recipes.map(&:id), 1
  end

  test "never repeats a non-filler recipe" do
    result = plan(varied_recipes, meal_count: 14, spoon_budget: 20)
    non_filler_ids = result.recipes.reject(&:filler?).map(&:id)
    assert_equal non_filler_ids.uniq, non_filler_ids
  end

  test "fillers can repeat to fill out the week" do
    result = plan([ recipe(1, 3), recipe(2, 0) ], meal_count: 5, spoon_budget: 3)
    assert_equal [ 1, 2, 2, 2, 2 ], result.recipes.map(&:id).sort
  end

  test "a multi-meal recipe can overflow the meal count as leftovers" do
    result = plan([ recipe(1, 2, 4) ], meal_count: 3, spoon_budget: 2)
    assert_equal [ 1 ], result.recipes.map(&:id)
    assert_equal 4, result.meals_planned
  end

  test "stops early when it runs out of recipes" do
    result = plan([ recipe(1, 1), recipe(2, 2) ], meal_count: 14, spoon_budget: 3)
    assert_equal [ 1, 2 ], result.recipes.map(&:id).sort
    assert_equal 2, result.meals_planned
  end

  test "returns an empty plan when there are no recipes" do
    result = plan([], meal_count: 14, spoon_budget: 10)
    assert_empty result.recipes
    assert_equal 0, result.total_spoons
  end

  test "prefers recipes not made recently but still sometimes picks recent ones" do
    fresh = recipe(1, 2)
    recent = recipe(2, 2)
    last_made_on = { recent.id => TODAY - 1 }

    picks = (1..300).map do |seed|
      plan([ fresh, recent ], meal_count: 1, spoon_budget: 2, last_made_on: last_made_on, seed: seed)
        .recipes.first.id
    end

    recent_count = picks.count(recent.id)
    assert_operator recent_count, :>, 0, "recent recipes should never be fully excluded"
    assert_operator picks.count(fresh.id), :>, recent_count * 3
  end
end
