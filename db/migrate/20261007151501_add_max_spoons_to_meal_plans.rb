class AddMaxSpoonsToMealPlans < ActiveRecord::Migration[8.1]
  def change
    # Optional cap: no single recipe in the plan may be harder than this. NULL means no cap.
    add_column :meal_plans, :max_spoons, :integer
    add_check_constraint :meal_plans, "max_spoons BETWEEN 0 AND 5", name: "max_spoons_range"
  end
end
