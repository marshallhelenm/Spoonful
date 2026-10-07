require "test_helper"

class MealPlanEntriesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @plan = meal_plans(:last_week)
    @entry = meal_plan_entries(:last_week_chili)
  end

  test "update swaps in the chosen recipe" do
    patch meal_plan_entry_path(@plan, @entry), params: { meal_plan_entry: { recipe_id: recipes(:pasta).id } }

    assert_redirected_to meal_plan_path(@plan)
    assert_equal recipes(:pasta), @entry.reload.recipe
    assert_equal "Swapped Big Pot Chili for Weeknight Pasta.", flash[:notice]
  end

  test "update allows a recipe over the plan's spoon cap when chosen explicitly" do
    @plan.update!(max_spoons: 1)
    patch meal_plan_entry_path(@plan, @entry), params: { meal_plan_entry: { recipe_id: recipes(:pasta).id } }
    assert_equal recipes(:pasta), @entry.reload.recipe
  end

  test "shuffle swaps in a different recipe" do
    post shuffle_meal_plan_entry_path(@plan, @entry)

    assert_redirected_to meal_plan_path(@plan)
    assert_not_equal recipes(:chili), @entry.reload.recipe
    assert_match "Swapped Big Pot Chili for", flash[:notice]
  end

  test "shuffle explains when nothing else fits" do
    @plan.update!(max_spoons: 0, budget_is_ceiling: true, spoon_budget: 0)
    Recipe.where(spoons: 0).where.not(id: recipes(:chili).id).destroy_all

    post shuffle_meal_plan_entry_path(@plan, @entry)

    assert_redirected_to meal_plan_path(@plan)
    assert_equal recipes(:chili), @entry.reload.recipe
    assert_equal "No other recipes fit this plan's rules.", flash[:alert]
  end

  test "destroy removes the meal from the plan" do
    assert_difference -> { @plan.entries.count }, -1 do
      delete meal_plan_entry_path(@plan, @entry)
    end
    assert_redirected_to meal_plan_path(@plan)
    assert_equal "Removed Big Pot Chili.", flash[:notice]
  end

  test "entries from a different plan can't be changed through this plan" do
    other_plan = MealPlan.create!(spoon_budget: 3)
    delete meal_plan_entry_path(other_plan, @entry)
    assert_response :not_found
    assert MealPlanEntry.exists?(@entry.id)
  end
end
