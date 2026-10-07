require "test_helper"

class ShoppingListCheckTest < ActiveSupport::TestCase
  test "an ingredient can only be checked once per plan" do
    plan = meal_plans(:last_week)
    plan.shopping_list_checks.create!(ingredient: ingredients(:onion))
    assert_not plan.shopping_list_checks.build(ingredient: ingredients(:onion)).valid?
  end

  test "checks are removed with their plan" do
    plan = meal_plans(:last_week)
    plan.shopping_list_checks.create!(ingredient: ingredients(:onion))
    assert_difference -> { ShoppingListCheck.count }, -1 do
      plan.destroy
    end
  end
end
