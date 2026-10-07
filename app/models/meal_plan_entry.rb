class MealPlanEntry < ApplicationRecord
  belongs_to :meal_plan
  belongs_to :recipe

  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 },
                       uniqueness: { scope: :meal_plan_id }
  validates :recipe, same_owner_as: :meal_plan

  # { recipe_id => most recent plan start date } across the entries in scope
  # (scope it to one user's plans first).
  def self.last_made_on_by_recipe
    joins(:meal_plan).group(:recipe_id).maximum("meal_plans.starts_on")
  end
end
