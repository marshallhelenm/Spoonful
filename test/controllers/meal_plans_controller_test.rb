require "test_helper"

class MealPlansControllerTest < ActionDispatch::IntegrationTest
  setup { sign_in_as(users(:one)) }

  test "root shows the new plan form with defaults" do
    get root_path

    assert_inertia_component "meal_plans/new"
    assert_equal 7, inertia.props[:defaults][:meal_count]
    assert_equal 3, inertia.props[:recipe_count]
    assert_equal 3, inertia.props[:included_recipe_count]
  end

  test "new counts only recipes included in meal plans" do
    recipes(:chili).update!(include_in_plans: false)
    get new_meal_plan_path

    assert_equal 3, inertia.props[:recipe_count]
    assert_equal 2, inertia.props[:included_recipe_count]
  end

  test "create builds a plan and shows it" do
    assert_difference -> { MealPlan.count } do
      post meal_plans_path, params: { meal_plan: { spoon_budget: 5, meal_count: 4, starts_on: "2026-10-05" } }
    end
    plan = MealPlan.order(:created_at).last
    assert_redirected_to meal_plan_path(plan)
    assert plan.entries.any?
  end

  test "create saves the spoon cap and the plan view shows it" do
    post meal_plans_path, params: { meal_plan: { spoon_budget: 5, meal_count: 4, max_spoons: 2 } }
    plan = MealPlan.order(:created_at).last
    assert_equal 2, plan.max_spoons

    follow_redirect!
    assert_equal 2, inertia.props[:meal_plan][:max_spoons]
  end

  test "create saves the budget ceiling option" do
    post meal_plans_path, params: { meal_plan: { spoon_budget: 5, meal_count: 4, budget_is_ceiling: true } }
    plan = MealPlan.order(:created_at).last
    assert plan.budget_is_ceiling
    assert_operator plan.total_spoons, :<=, 5
  end

  test "create with an invalid budget redirects back with errors" do
    assert_no_difference -> { MealPlan.count } do
      post meal_plans_path, params: { meal_plan: { spoon_budget: "", meal_count: 7 } }
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
    assert_equal [ "Takeout", "Weeknight Pasta", "Big Pot Chili" ], inertia.props[:recipes].map { it[:name] }
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
