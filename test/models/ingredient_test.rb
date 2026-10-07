require "test_helper"

class IngredientTest < ActiveSupport::TestCase
  test "names are unique regardless of capitalization" do
    duplicate = Ingredient.new(name: "TOMATO")
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:name], "has already been taken"
  end

  test "the database also rejects case-only duplicates" do
    assert_raises(ActiveRecord::RecordNotUnique) do
      Ingredient.new(name: "tomato").save!(validate: false)
    end
  end

  test "squishes whitespace in names" do
    assert_equal "Green onion", Ingredient.new(name: "  Green   onion ").name
  end

  test "find_or_create_by_name! reuses an existing ingredient ignoring case and spacing" do
    assert_no_difference -> { Ingredient.count } do
      assert_equal ingredients(:tomato), Ingredient.find_or_create_by_name!("  tomato ")
    end
  end

  test "find_or_create_by_name! creates new ingredients" do
    assert_difference -> { Ingredient.count } do
      assert_equal "Garlic", Ingredient.find_or_create_by_name!("Garlic").name
    end
  end

  test "an ingredient used by a recipe can't be deleted" do
    assert_not ingredients(:onion).destroy
    assert Ingredient.exists?(ingredients(:onion).id)
  end
end
