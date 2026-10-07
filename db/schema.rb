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

ActiveRecord::Schema[8.1].define(version: 2026_10_07_151936) do
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
    t.index ["starts_on"], name: "index_meal_plans_on_starts_on"
    t.check_constraint "max_spoons BETWEEN 0 AND 5", name: "max_spoons_range"
    t.check_constraint "meal_count >= 1", name: "meal_count_positive"
    t.check_constraint "spoon_budget >= 0", name: "spoon_budget_non_negative"
  end

  create_table "recipes", force: :cascade do |t|
    t.string "name", null: false
    t.integer "spoons", null: false
    t.integer "meals_covered", default: 1, null: false
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_recipes_on_name", unique: true
    t.check_constraint "meals_covered >= 1", name: "meals_covered_positive"
    t.check_constraint "spoons BETWEEN 0 AND 5", name: "spoons_range"
  end

  add_foreign_key "meal_plan_entries", "meal_plans"
  add_foreign_key "meal_plan_entries", "recipes"
end
