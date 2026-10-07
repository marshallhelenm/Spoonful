require "test_helper"

class IngredientTest < ActiveSupport::TestCase
  test "names are unique regardless of capitalization" do
    duplicate = users(:one).ingredients.new(name: "TOMATO")
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:name], "has already been taken"
  end

  test "the database also rejects case-only duplicates" do
    assert_raises(ActiveRecord::RecordNotUnique) do
      users(:one).ingredients.new(name: "tomato").save!(validate: false)
    end
  end

  test "squishes whitespace in names" do
    assert_equal "Green onion", users(:one).ingredients.new(name: "  Green   onion ").name
  end

  test "find_or_create_by_name! reuses an existing ingredient ignoring case and spacing" do
    assert_no_difference -> { Ingredient.count } do
      assert_equal ingredients(:tomato), users(:one).ingredients.find_or_create_by_name!("  tomato ")
    end
  end

  test "find_or_create_by_name! creates new ingredients" do
    assert_difference -> { Ingredient.count } do
      assert_equal "Garlic", users(:one).ingredients.find_or_create_by_name!("Garlic").name
    end
  end

  test "an ingredient used by a recipe can't be deleted" do
    assert_not ingredients(:onion).destroy
    assert Ingredient.exists?(ingredients(:onion).id)
  end

  test "merge_into! moves recipe lines to the target and deletes the merged ingredient" do
    beans = ingredients(:kidney_beans)
    target = users(:one).ingredients.create!(name: "Red kidney beans")

    beans.merge_into!(target)

    assert_not Ingredient.exists?(beans.id)
    assert_equal [ { name: "Red kidney beans", amount: "2 cans" }, { name: "Onion", amount: "1" } ],
                 recipes(:chili).reload.ingredient_lines
  end

  test "merge_into! combines lines when a recipe lists both ingredients" do
    chili = recipes(:chili)
    chili.save_with_ingredients([ { name: "Onion", amount: "1" }, { name: "Onions", amount: "half" } ])

    Ingredient.find_by!(name: "Onions").merge_into!(ingredients(:onion))

    assert_equal [ { name: "Onion", amount: "1 + half" } ], chili.reload.ingredient_lines
  end

  test "merge_into! keeps a single amount when only one line had one" do
    chili = recipes(:chili)
    chili.save_with_ingredients([ { name: "Onion", amount: nil }, { name: "Onions", amount: "2" } ])

    Ingredient.find_by!(name: "Onions").merge_into!(ingredients(:onion))

    assert_equal [ { name: "Onion", amount: "2" } ], chili.reload.ingredient_lines
  end

  test "merge_into! moves shopping list checks without duplicating them" do
    plan = meal_plans(:last_week)
    other_plan = users(:one).meal_plans.create!(spoon_budget: 5)
    onions = users(:one).ingredients.create!(name: "Onions")
    plan.shopping_list_checks.create!(ingredient: onions)
    plan.shopping_list_checks.create!(ingredient: ingredients(:onion))
    other_plan.shopping_list_checks.create!(ingredient: onions)

    onions.merge_into!(ingredients(:onion))

    assert_equal 1, plan.shopping_list_checks.count
    assert other_plan.shopping_list_checks.exists?(ingredient: ingredients(:onion))
  end

  test "merge_into! refuses to merge an ingredient into itself" do
    assert_raises(ArgumentError) { ingredients(:onion).merge_into!(ingredients(:onion)) }
  end
end
