require "test_helper"

class ShoppingListCheckTest < ActiveSupport::TestCase
  test "an ingredient can only be checked once per plan" do
    plan = meal_plans(:last_week)
    plan.shopping_list_checks.create!(ingredient: ingredients(:onion))
    assert_not plan.shopping_list_checks.build(ingredient: ingredients(:onion)).valid?
  end

  test "can't check off another user's ingredient" do
    check = meal_plans(:last_week).shopping_list_checks.build(ingredient: ingredients(:secret_spice))
    assert_not check.valid?
    assert_includes check.errors[:ingredient], "must be one of your ingredients"
  end

  test "checks are removed with their plan" do
    plan = meal_plans(:last_week)
    plan.shopping_list_checks.create!(ingredient: ingredients(:onion))
    assert_difference -> { ShoppingListCheck.count }, -1 do
      plan.destroy
    end
  end
end
