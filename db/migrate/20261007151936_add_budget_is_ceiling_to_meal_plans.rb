class AddBudgetIsCeilingToMealPlans < ActiveRecord::Migration[8.1]
  def change
    # When true, the plan's total spoons must never exceed spoon_budget.
    add_column :meal_plans, :budget_is_ceiling, :boolean, null: false, default: false
  end
end
