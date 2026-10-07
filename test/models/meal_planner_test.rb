require "test_helper"

class MealPlannerTest < ActiveSupport::TestCase
  TODAY = Date.new(2026, 10, 5)

  # Unsaved recipes with ids: the planner never touches the database.
  def recipe(id, spoons, meals_covered = 1)
    Recipe.new(id: id, name: "Recipe #{id}", spoons: spoons, meals_covered: meals_covered)
  end

  def plan(recipes, meal_count:, spoon_budget:, max_spoons: nil, budget_is_ceiling: false, last_made_on: {}, seed: 1)
    MealPlanner.new(recipes: recipes, meal_count: meal_count, spoon_budget: spoon_budget, max_spoons: max_spoons,
                    budget_is_ceiling: budget_is_ceiling, last_made_on: last_made_on, today: TODAY,
                    random: Random.new(seed)).call
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

  test "as a ceiling, the budget is never exceeded even if that leaves meals unfilled" do
    result = plan([ recipe(1, 5), recipe(2, 5) ], meal_count: 2, spoon_budget: 9, budget_is_ceiling: true)
    assert_equal 5, result.total_spoons
    assert_equal 1, result.meals_planned
  end

  test "as a ceiling, it still gets as close to the budget as it can" do
    [ 1, 2, 3, 4, 5 ].each do |seed|
      result = plan(varied_recipes, meal_count: 14, spoon_budget: 12, budget_is_ceiling: true, seed: seed)
      assert_equal 12, result.total_spoons, "seed #{seed}"
      assert_operator result.meals_planned, :>=, 14, "seed #{seed}"
    end
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

  def replacement(recipes, others:, replacing:, spoon_budget: 10, seed: 1, **options)
    MealPlanner.new(recipes: recipes, meal_count: 14, spoon_budget: spoon_budget, today: TODAY,
                    random: Random.new(seed), **options)
      .pick_replacement(others: others, replacing: replacing)
  end

  test "a replacement is never the recipe being replaced or another planned recipe" do
    recipes = [ recipe(1, 2), recipe(2, 2), recipe(3, 2), recipe(4, 2) ]
    picks = (1..50).map do |seed|
      replacement(recipes, others: [ recipes[1], recipes[2] ], replacing: recipes[0], seed: seed).id
    end
    assert_equal [ 4 ], picks.uniq
  end

  test "a replacement can be a filler that's already in the plan" do
    takeout = recipe(9, 0)
    result = replacement([ recipe(1, 3), takeout ], others: [ takeout ], replacing: recipe(1, 3), spoon_budget: 0)
    assert_equal 9, result.id
  end

  test "a replacement respects the spoon cap" do
    recipes = [ recipe(1, 2), recipe(2, 5), recipe(3, 1) ]
    picks = (1..50).map do |seed|
      replacement(recipes, others: [], replacing: recipes[0], max_spoons: 2, seed: seed).id
    end
    assert_equal [ 3 ], picks.uniq
  end

  test "a replacement respects the budget ceiling" do
    recipes = [ recipe(1, 2), recipe(2, 4), recipe(3, 1) ]
    # Others use 8 of 10 spoons, so at most 2 spoons are left for the swap.
    picks = (1..50).map do |seed|
      replacement(recipes, others: [ recipe(7, 4), recipe(8, 4) ], replacing: recipes[0],
                           budget_is_ceiling: true, seed: seed).id
    end
    assert_equal [ 3 ], picks.uniq
  end

  test "a replacement leans toward keeping the plan near budget but stays random" do
    recipes = [ recipe(1, 2), recipe(2, 2), recipe(3, 5) ]
    picks = (1..200).map do |seed|
      replacement(recipes, others: [ recipe(7, 4), recipe(8, 4) ], replacing: recipes[0], seed: seed).id
    end
    assert_operator picks.count(2), :>, picks.count(3)
    assert_operator picks.count(3), :>, 0
  end

  test "no replacement when nothing else fits" do
    assert_nil replacement([ recipe(1, 2) ], others: [], replacing: recipe(1, 2))
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
