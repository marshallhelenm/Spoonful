require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "downcases and strips the email address" do
    assert_equal "someone@example.com", User.new(email_address: " SomeOne@Example.COM ").email_address
  end

  test "requires a plausible email address" do
    assert_not User.new(email_address: "not-an-email", password: "a-good-password").valid?
  end

  test "requires a password of at least 8 characters" do
    assert_not User.new(email_address: "a@example.com", password: "short").valid?
    assert User.new(email_address: "a@example.com", password: "long enough").valid?
  end

  test "last_made_on_by_recipe covers only this user's plans, minus the one excepted" do
    user = users(:one)
    newer = user.meal_plans.create!(starts_on: Date.new(2026, 10, 5), spoon_budget: 5)
    newer.entries.create!(recipe: recipes(:pasta), position: 0)

    assert_equal({ recipes(:chili).id => Date.new(2026, 9, 28), recipes(:pasta).id => Date.new(2026, 10, 5) },
                 user.last_made_on_by_recipe)
    assert_equal({ recipes(:chili).id => Date.new(2026, 9, 28) }, user.last_made_on_by_recipe(except: newer))
  end

  test "deleting a user deletes all their data" do
    user = users(:one)
    assert_difference({ "Recipe.count" => -3, "MealPlan.count" => -1, "Ingredient.count" => -3 }) do
      user.destroy!
    end
    assert Recipe.exists?(recipes(:secret_soup).id)
  end

  test "the demo account can't be deleted" do
    demo = DemoAccount.user
    assert_not demo.destroy
    assert User.exists?(demo.id)
  end

  test "a taken email suggests signing in only when signing up" do
    taken = users(:two).email_address
    assert_includes User.new(email_address: taken, password: "a-good-password").tap(&:validate).errors[:email_address],
                    "already has an account. Try signing in instead"

    user = users(:one)
    user.email_address = taken
    user.validate
    assert_equal [ "already has an account" ], user.errors[:email_address]
  end
end
