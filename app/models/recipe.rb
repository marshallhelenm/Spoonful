class Recipe < ApplicationRecord
  SPOON_RANGE = 0..5

  # Keep past plans intact: a recipe that's been planned can't be deleted.
  has_many :meal_plan_entries, dependent: :restrict_with_error
  has_many :recipe_ingredients, -> { order(:position) }, dependent: :destroy
  has_many :ingredients, through: :recipe_ingredients

  normalizes :name, with: ->(name) { name.squish }

  validates :name, presence: true, uniqueness: { case_sensitive: false }
  validates :spoons, presence: { message: "needs a rating" },
                     numericality: { only_integer: true, in: SPOON_RANGE, allow_nil: true }
  validates :meals_covered, numericality: { only_integer: true, greater_than_or_equal_to: 1 }

  # 0-spoon meals (takeout, leftovers) may repeat within a plan; others may not.
  def filler?
    spoons.zero?
  end

  # Saves the recipe and replaces its ingredient list in one transaction.
  # `lines` is an array of { name:, amount: } hashes (blank names are skipped),
  # or nil to leave the ingredients as they are.
  # Returns false (and saves nothing) if the recipe is invalid.
  def save_with_ingredients(lines)
    saved = transaction do
      raise ActiveRecord::Rollback unless save

      replace_ingredients!(lines) unless lines.nil?
      true
    end
    saved || false
  end

  # [{ name:, amount: }] in list order, as the recipe form expects.
  def ingredient_lines
    recipe_ingredients.includes(:ingredient).map do |line|
      { name: line.ingredient.name, amount: line.amount }
    end
  end

  private

  def replace_ingredients!(lines)
    recipe_ingredients.destroy_all
    lines.map { it.to_h.with_indifferent_access }.reject { |line| line[:name].blank? }.each_with_index do |line, position|
      recipe_ingredients.create!(
        ingredient: Ingredient.find_or_create_by_name!(line[:name]),
        amount: line[:amount],
        position: position
      )
    end
    recipe_ingredients.reset
  end
end
