# Marks one ingredient as checked off ("got it") on a meal plan's shopping list.
class ShoppingListCheck < ApplicationRecord
  belongs_to :meal_plan
  belongs_to :ingredient

  validates :ingredient_id, uniqueness: { scope: :meal_plan_id }
  validate :ingredient_belongs_to_plan_owner

  private

  def ingredient_belongs_to_plan_owner
    if ingredient && meal_plan && ingredient.user_id != meal_plan.user_id
      errors.add(:ingredient, "must be one of your ingredients")
    end
  end
end
