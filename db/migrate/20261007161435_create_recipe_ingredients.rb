class CreateRecipeIngredients < ActiveRecord::Migration[8.1]
  def change
    create_table :recipe_ingredients do |t|
      t.references :recipe, null: false, foreign_key: true
      t.references :ingredient, null: false, foreign_key: true
      t.string :amount
      t.integer :position, null: false

      t.timestamps
    end

    add_index :recipe_ingredients, [ :recipe_id, :position ], unique: true
  end
end
