# A shared ingredient name ("Tomato") that recipes reference, so the same
# ingredient isn't stored under several spellings.
class Ingredient < ApplicationRecord
  has_many :recipe_ingredients, dependent: :restrict_with_error
  has_many :recipes, through: :recipe_ingredients
  has_many :shopping_list_checks, dependent: :delete_all

  normalizes :name, with: ->(name) { name.squish }

  validates :name, presence: true, uniqueness: { case_sensitive: false }

  # Finds an ingredient by name ignoring capitalization and extra spaces, or creates it.
  def self.find_or_create_by_name!(name)
    normalized = normalize_value_for(:name, name)
    find_by("lower(name) = ?", normalized.downcase) || create!(name: normalized)
  end

  # Folds this ingredient into `target` (e.g. "Tomatoes" into "Tomato") and
  # deletes it. Every recipe line and shopping-list checkmark moves to the
  # target. If a recipe lists both, they become one line with both amounts
  # ("1 can + 2 cups").
  def merge_into!(target)
    raise ArgumentError, "can't merge an ingredient into itself" if target == self

    transaction do
      recipe_ingredients.find_each do |line|
        existing = target.recipe_ingredients.find_by(recipe_id: line.recipe_id)
        if existing
          existing.update!(amount: [ existing.amount, line.amount ].compact.join(" + ").presence)
          line.destroy!
        else
          line.update!(ingredient: target)
        end
      end

      shopping_list_checks.find_each do |check|
        if target.shopping_list_checks.exists?(meal_plan_id: check.meal_plan_id)
          check.destroy!
        else
          check.update!(ingredient: target)
        end
      end

      recipe_ingredients.reset
      destroy!
    end
  end
end
