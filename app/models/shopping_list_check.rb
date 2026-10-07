# Marks one ingredient as checked off ("got it") on a meal plan's shopping list.
class ShoppingListCheck < ApplicationRecord
  belongs_to :meal_plan
  belongs_to :ingredient

  validates :ingredient_id, uniqueness: { scope: :meal_plan_id }
end
