# One line in a recipe's ingredient list: an ingredient, an optional free-text
# amount ("2 cups"), and its position in the list.
class RecipeIngredient < ApplicationRecord
  belongs_to :recipe
  belongs_to :ingredient

  normalizes :amount, with: ->(amount) { amount.squish.presence }

  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 },
                       uniqueness: { scope: :recipe_id }
end
