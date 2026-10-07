# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_10_07_184000) do
  create_table "ingredients", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index "user_id, lower(name)", name: "index_ingredients_on_user_id_and_lower_name", unique: true
    t.index ["user_id"], name: "index_ingredients_on_user_id"
  end

  create_table "meal_plan_entries", force: :cascade do |t|
    t.integer "meal_plan_id", null: false
    t.integer "recipe_id", null: false
    t.integer "position", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["meal_plan_id", "position"], name: "index_meal_plan_entries_on_meal_plan_id_and_position", unique: true
    t.index ["meal_plan_id"], name: "index_meal_plan_entries_on_meal_plan_id"
    t.index ["recipe_id"], name: "index_meal_plan_entries_on_recipe_id"
  end

  create_table "meal_plans", force: :cascade do |t|
    t.date "starts_on", null: false
    t.integer "meal_count", default: 14, null: false
    t.integer "spoon_budget", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "max_spoons"
    t.boolean "budget_is_ceiling", default: false, null: false
    t.integer "user_id", null: false
    t.index ["starts_on"], name: "index_meal_plans_on_starts_on"
    t.index ["user_id"], name: "index_meal_plans_on_user_id"
    t.check_constraint "max_spoons BETWEEN 0 AND 5", name: "max_spoons_range"
    t.check_constraint "meal_count >= 1", name: "meal_count_positive"
    t.check_constraint "spoon_budget >= 0", name: "spoon_budget_non_negative"
  end

  create_table "recipe_ingredients", force: :cascade do |t|
    t.integer "recipe_id", null: false
    t.integer "ingredient_id", null: false
    t.string "amount"
    t.integer "position", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ingredient_id"], name: "index_recipe_ingredients_on_ingredient_id"
    t.index ["recipe_id", "position"], name: "index_recipe_ingredients_on_recipe_id_and_position", unique: true
    t.index ["recipe_id"], name: "index_recipe_ingredients_on_recipe_id"
  end

  create_table "recipes", force: :cascade do |t|
    t.string "name", null: false
    t.integer "spoons", null: false
    t.integer "meals_covered", default: 1, null: false
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["user_id", "name"], name: "index_recipes_on_user_id_and_name", unique: true
    t.index ["user_id"], name: "index_recipes_on_user_id"
    t.check_constraint "meals_covered >= 1", name: "meals_covered_positive"
    t.check_constraint "spoons BETWEEN 0 AND 5", name: "spoons_range"
  end

  create_table "sessions", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "ip_address"
    t.string "user_agent"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "shopping_list_checks", force: :cascade do |t|
    t.integer "meal_plan_id", null: false
    t.integer "ingredient_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ingredient_id"], name: "index_shopping_list_checks_on_ingredient_id"
    t.index ["meal_plan_id", "ingredient_id"], name: "index_shopping_list_checks_on_meal_plan_id_and_ingredient_id", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email_address", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email_address"], name: "index_users_on_email_address", unique: true
  end

  add_foreign_key "ingredients", "users"
  add_foreign_key "meal_plan_entries", "meal_plans"
  add_foreign_key "meal_plan_entries", "recipes"
  add_foreign_key "meal_plans", "users"
  add_foreign_key "recipe_ingredients", "ingredients"
  add_foreign_key "recipe_ingredients", "recipes"
  add_foreign_key "recipes", "users"
  add_foreign_key "sessions", "users"
  add_foreign_key "shopping_list_checks", "ingredients"
  add_foreign_key "shopping_list_checks", "meal_plans"
end
