require "test_helper"

class ShoppingListsControllerTest < ActionDispatch::IntegrationTest
  setup { sign_in_as(users(:one)) }

  setup do
    @plan = meal_plans(:last_week) # has Big Pot Chili: Kidney beans "2 cans", Onion "1"
  end

  test "show lists the plan's ingredients with amounts and check state" do
    @plan.shopping_list_checks.create!(ingredient: ingredients(:onion))

    get meal_plan_shopping_list_path(@plan)

    assert_inertia_component "shopping_lists/show"
    items = inertia.props[:items]
    assert_equal [ "Kidney beans", "Onion" ], items.map { it[:name] }
    assert_equal [ false, true ], items.map { it[:checked] }
    assert_equal [ { "recipe_name" => "Big Pot Chili", "amount" => "2 cans", "times" => 1 } ],
                 items.first[:uses].map(&:to_h)
    assert_empty inertia.props[:recipes_without_ingredients]
  end

  test "checking an item saves it" do
    assert_difference -> { @plan.shopping_list_checks.count } do
      patch meal_plan_shopping_list_item_path(@plan, ingredients(:onion)), params: { checked: true }, as: :json
    end
    assert_redirected_to meal_plan_shopping_list_path(@plan)
  end

  test "checking an already-checked item is harmless" do
    @plan.shopping_list_checks.create!(ingredient: ingredients(:onion))
    assert_no_difference -> { @plan.shopping_list_checks.count } do
      patch meal_plan_shopping_list_item_path(@plan, ingredients(:onion)), params: { checked: true }, as: :json
    end
  end

  test "unchecking an item removes the check" do
    @plan.shopping_list_checks.create!(ingredient: ingredients(:onion))
    assert_difference -> { @plan.shopping_list_checks.count }, -1 do
      patch meal_plan_shopping_list_item_path(@plan, ingredients(:onion)), params: { checked: false }, as: :json
    end
  end
end
