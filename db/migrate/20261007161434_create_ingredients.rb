class CreateIngredients < ActiveRecord::Migration[8.1]
  def change
    create_table :ingredients do |t|
      t.string :name, null: false

      t.timestamps
    end

    # One ingredient per name regardless of capitalization ("Tomato" == "tomato").
    add_index :ingredients, "lower(name)", unique: true, name: "index_ingredients_on_lower_name"
  end
end
