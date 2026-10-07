require "test_helper"

class MealPlanEntryTest < ActiveSupport::TestCase
  test "position must be unique within a plan" do
    entry = meal_plans(:last_week).entries.build(recipe: recipes(:pasta), position: 0)
    assert_not entry.valid?
    assert_includes entry.errors[:position], "has already been taken"
  end

  test "last_made_on_by_recipe returns each recipe's most recent plan date" do
    newer = MealPlan.create!(starts_on: Date.new(2026, 10, 5), spoon_budget: 5)
    newer.entries.create!(recipe: recipes(:pasta), position: 0)
    newer.entries.create!(recipe: recipes(:chili), position: 1)

    assert_equal(
      { recipes(:chili).id => Date.new(2026, 10, 5), recipes(:pasta).id => Date.new(2026, 10, 5) },
      MealPlanEntry.last_made_on_by_recipe
    )
  end
end
