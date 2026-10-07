class CreateShoppingListChecks < ActiveRecord::Migration[8.1]
  def change
    # A row means "this ingredient is checked off on this plan's shopping list".
    create_table :shopping_list_checks do |t|
      t.references :meal_plan, null: false, foreign_key: true, index: false
      t.references :ingredient, null: false, foreign_key: true

      t.timestamps
    end

    add_index :shopping_list_checks, [ :meal_plan_id, :ingredient_id ], unique: true
  end
end
