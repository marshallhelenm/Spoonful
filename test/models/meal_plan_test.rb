require "test_helper"

class MealPlanTest < ActiveSupport::TestCase
  test "meal count defaults to 14" do
    assert_equal 14, MealPlan.new.meal_count
  end

  test "requires a start date and a non-negative whole budget" do
    plan = MealPlan.new(spoon_budget: -1, starts_on: nil)
    assert_not plan.valid?
    assert plan.errors[:starts_on].any?
    assert plan.errors[:spoon_budget].any?
  end

  test "meal count must be at least 1" do
    assert_not MealPlan.new(starts_on: Date.current, spoon_budget: 5, meal_count: 0).valid?
  end

  test "starts on defaults to today" do
    assert_equal Date.current, MealPlan.new.starts_on
  end

  test "save_and_fill saves a plan with ordered entries" do
    plan = MealPlan.new(spoon_budget: 5, meal_count: 6, starts_on: Date.new(2026, 10, 5))

    assert plan.save_and_fill(random: Random.new(1))
    assert plan.persisted?
    assert_equal (0...plan.entries.size).to_a, plan.entries.map(&:position)
    assert plan.meals_planned >= 6
    assert_equal plan.recipes.sum(&:spoons), plan.total_spoons
  end

  test "save_and_fill returns false and saves nothing when invalid" do
    plan = MealPlan.new(spoon_budget: -1)
    assert_no_difference -> { MealPlan.count } do
      assert_not plan.save_and_fill
    end
  end

  test "fill! replaces existing entries" do
    plan = meal_plans(:last_week)
    old_entry_ids = plan.entries.ids

    plan.fill!(random: Random.new(2))

    assert plan.entries.any?
    assert_empty old_entry_ids & plan.entries.reload.ids
  end

  test "a recipe used in a plan can't be deleted" do
    chili = recipes(:chili)
    assert_not chili.destroy
    assert chili.errors[:base].any?
    assert Recipe.exists?(chili.id)
  end
end
