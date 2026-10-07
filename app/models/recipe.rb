class Recipe < ApplicationRecord
  SPOON_RANGE = 0..5

  # Keep past plans intact: a recipe that's been planned can't be deleted.
  has_many :meal_plan_entries, dependent: :restrict_with_error

  normalizes :name, with: ->(name) { name.squish }

  validates :name, presence: true, uniqueness: { case_sensitive: false }
  validates :spoons, presence: { message: "needs a rating" },
                     numericality: { only_integer: true, in: SPOON_RANGE, allow_nil: true }
  validates :meals_covered, numericality: { only_integer: true, greater_than_or_equal_to: 1 }

  # 0-spoon meals (takeout, leftovers) may repeat within a plan; others may not.
  def filler?
    spoons.zero?
  end
end
