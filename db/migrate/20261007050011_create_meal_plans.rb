class CreateMealPlans < ActiveRecord::Migration[8.1]
  def change
    create_table :meal_plans do |t|
      t.date :starts_on, null: false
      t.integer :meal_count, null: false, default: 14
      t.integer :spoon_budget, null: false

      t.timestamps
    end

    add_index :meal_plans, :starts_on
    add_check_constraint :meal_plans, "meal_count >= 1", name: "meal_count_positive"
    add_check_constraint :meal_plans, "spoon_budget >= 0", name: "spoon_budget_non_negative"
  end
end
