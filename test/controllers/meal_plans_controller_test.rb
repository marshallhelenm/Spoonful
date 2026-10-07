require "test_helper"

class MealPlansControllerTest < ActionDispatch::IntegrationTest
  test "root shows the new plan form with defaults" do
    get root_path

    assert_inertia_component "meal_plans/new"
    assert_equal 14, inertia.props[:defaults][:meal_count]
    assert_equal 3, inertia.props[:recipe_count]
  end

  test "create builds a plan and shows it" do
    assert_difference -> { MealPlan.count } do
      post meal_plans_path, params: { meal_plan: { spoon_budget: 5, meal_count: 4, starts_on: "2026-10-05" } }
    end
    plan = MealPlan.order(:created_at).last
    assert_redirected_to meal_plan_path(plan)
    assert plan.entries.any?
  end

  test "create with an invalid budget redirects back with errors" do
    assert_no_difference -> { MealPlan.count } do
      post meal_plans_path, params: { meal_plan: { spoon_budget: "", meal_count: 14 } }
    end
    assert_redirected_to new_meal_plan_path
    follow_redirect!
    assert inertia.props[:errors][:spoon_budget].present?
  end

  test "show includes totals and entries" do
    get meal_plan_path(meal_plans(:last_week))

    assert_inertia_component "meal_plans/show"
    plan = inertia.props[:meal_plan]
    assert_equal 3, plan[:total_spoons]
    assert_equal 4, plan[:meals_planned]
    assert_equal [ "Big Pot Chili" ], plan[:entries].map { it[:name] }
  end

  test "reshuffle re-picks the plan's recipes" do
    plan = meal_plans(:last_week)
    post reshuffle_meal_plan_path(plan)
    assert_redirected_to meal_plan_path(plan)
    assert plan.entries.reload.any?
  end

  test "destroy deletes a plan" do
    assert_difference -> { MealPlan.count }, -1 do
      delete meal_plan_path(meal_plans(:last_week))
    end
    assert_redirected_to meal_plans_path
  end
end
