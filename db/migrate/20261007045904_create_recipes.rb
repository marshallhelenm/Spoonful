class CreateRecipes < ActiveRecord::Migration[8.1]
  def change
    create_table :recipes do |t|
      t.string :name, null: false
      t.integer :spoons, null: false
      t.integer :meals_covered, null: false, default: 1
      t.text :notes

      t.timestamps
    end

    add_index :recipes, :name, unique: true
    add_check_constraint :recipes, "spoons BETWEEN 0 AND 5", name: "spoons_range"
    add_check_constraint :recipes, "meals_covered >= 1", name: "meals_covered_positive"
  end
end
