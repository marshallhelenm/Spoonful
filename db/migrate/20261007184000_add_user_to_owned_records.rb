# Every recipe, ingredient, and meal plan belongs to a user. Everything else
# (plan entries, ingredient lines, shopping checks) belongs to one of those.
# Existing dev data was cleared rather than migrated, so the columns can be required.
class AddUserToOwnedRecords < ActiveRecord::Migration[8.1]
  def change
    add_reference :recipes, :user, null: false, foreign_key: true
    add_reference :ingredients, :user, null: false, foreign_key: true
    add_reference :meal_plans, :user, null: false, foreign_key: true

    # Names only need to be unique within one user's data.
    remove_index :recipes, :name, unique: true
    add_index :recipes, [ :user_id, :name ], unique: true

    remove_index :ingredients, name: "index_ingredients_on_lower_name"
    add_index :ingredients, "user_id, lower(name)", unique: true, name: "index_ingredients_on_user_id_and_lower_name"
  end
end
