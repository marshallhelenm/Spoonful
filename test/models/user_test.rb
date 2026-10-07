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

  test "deleting a user deletes all their data" do
    user = users(:one)
    assert_difference({ "Recipe.count" => -3, "MealPlan.count" => -1, "Ingredient.count" => -3 }) do
      user.destroy!
    end
    assert Recipe.exists?(recipes(:secret_soup).id)
  end
end
