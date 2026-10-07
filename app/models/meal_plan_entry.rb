class MealPlanEntry < ApplicationRecord
  belongs_to :meal_plan
  belongs_to :recipe

  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 },
                       uniqueness: { scope: :meal_plan_id }

  # { recipe_id => most recent plan start date } across all saved plans.
  def self.last_made_on_by_recipe
    joins(:meal_plan).group(:recipe_id).maximum("meal_plans.starts_on")
  end
end
