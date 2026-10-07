# A shared ingredient name ("Tomato") that recipes reference, so the same
# ingredient isn't stored under several spellings.
class Ingredient < ApplicationRecord
  has_many :recipe_ingredients, dependent: :restrict_with_error
  has_many :recipes, through: :recipe_ingredients

  normalizes :name, with: ->(name) { name.squish }

  validates :name, presence: true, uniqueness: { case_sensitive: false }

  # Finds an ingredient by name ignoring capitalization and extra spaces, or creates it.
  def self.find_or_create_by_name!(name)
    normalized = normalize_value_for(:name, name)
    find_by("lower(name) = ?", normalized.downcase) || create!(name: normalized)
  end
end
