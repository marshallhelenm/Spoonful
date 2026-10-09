class AddIncludeInPlansToRecipes < ActiveRecord::Migration[8.1]
  def change
    add_column :recipes, :include_in_plans, :boolean, default: true, null: false
  end
end
