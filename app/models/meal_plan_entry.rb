class MealPlanEntry < ApplicationRecord
  belongs_to :meal_plan
  belongs_to :recipe

  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 },
                       uniqueness: { scope: :meal_plan_id }
  validate :recipe_belongs_to_plan_owner

  # { recipe_id => most recent plan start date } across the entries in scope
  # (scope it to one user's plans first).
  def self.last_made_on_by_recipe
    joins(:meal_plan).group(:recipe_id).maximum("meal_plans.starts_on")
  end

  private

  def recipe_belongs_to_plan_owner
    errors.add(:recipe, "must be one of your recipes") if recipe && meal_plan && recipe.user_id != meal_plan.user_id
  end
end
