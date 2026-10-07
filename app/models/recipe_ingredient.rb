# One line in a recipe's ingredient list: an ingredient, an optional free-text
# amount ("2 cups"), and its position in the list.
class RecipeIngredient < ApplicationRecord
  belongs_to :recipe
  belongs_to :ingredient

  normalizes :amount, with: ->(amount) { amount.squish.presence }

  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 },
                       uniqueness: { scope: :recipe_id }
  validate :ingredient_belongs_to_recipe_owner

  private

  def ingredient_belongs_to_recipe_owner
    if ingredient && recipe && ingredient.user_id != recipe.user_id
      errors.add(:ingredient, "must be one of your ingredients")
    end
  end
end
