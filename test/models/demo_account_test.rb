require "test_helper"

class DemoAccountTest < ActiveSupport::TestCase
  test "reset wipes the demo account's changes and reloads the sample recipes" do
    demo = DemoAccount.reset!
    demo.recipes.find_by!(name: "Lasagna").destroy!
    demo.recipes.create!(name: "Something rude", spoons: 1, meals_covered: 1)
    demo.meal_plans.create!(spoon_budget: 10)

    DemoAccount.reset!

    assert_equal SampleRecipes::RECIPES.size, demo.recipes.count
    assert demo.recipes.exists?(name: "Lasagna")
    assert_not demo.recipes.exists?(name: "Something rude")
    assert_equal 0, demo.meal_plans.count
  end

  test "reset leaves other accounts alone" do
    assert_no_difference -> { users(:one).recipes.count } do
      DemoAccount.reset!
    end
  end

  test "the demo login can't be changed" do
    demo = DemoAccount.user

    assert_not demo.update(password: "a-new-password")
    assert_not demo.update(email_address: "mine-now@example.com")
    assert demo.reload.authenticate(DemoAccount::PASSWORD)
  end

  test "other accounts can still change their password" do
    assert users(:one).update(password: "a-new-password")
  end
end
