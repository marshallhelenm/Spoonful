class CreateMealPlanEntries < ActiveRecord::Migration[8.1]
  def change
    create_table :meal_plan_entries do |t|
      t.references :meal_plan, null: false, foreign_key: true
      t.references :recipe, null: false, foreign_key: true
      t.integer :position, null: false

      t.timestamps
    end

    add_index :meal_plan_entries, [ :meal_plan_id, :position ], unique: true
  end
end
