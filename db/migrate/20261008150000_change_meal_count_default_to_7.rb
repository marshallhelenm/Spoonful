class ChangeMealCountDefaultTo7 < ActiveRecord::Migration[8.1]
  def change
    change_column_default :meal_plans, :meal_count, from: 14, to: 7
  end
end
