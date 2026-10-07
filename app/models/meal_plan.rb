class MealPlan < ApplicationRecord
  DEFAULT_MEAL_COUNT = 14

  has_many :entries, -> { order(:position) }, class_name: "MealPlanEntry", dependent: :destroy
  has_many :recipes, through: :entries

  attribute :meal_count, default: DEFAULT_MEAL_COUNT

  validates :starts_on, presence: true
  validates :meal_count, numericality: { only_integer: true, greater_than_or_equal_to: 1 }
  validates :spoon_budget, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  # Builds and saves a plan, picking recipes with MealPlanner.
  def self.generate!(spoon_budget:, meal_count: DEFAULT_MEAL_COUNT, starts_on: Date.current, random: Random.new)
    result = MealPlanner.new(
      recipes: Recipe.all.to_a,
      meal_count: meal_count,
      spoon_budget: spoon_budget,
      last_made_on: MealPlanEntry.last_made_on_by_recipe,
      today: starts_on,
      random: random
    ).call

    transaction do
      plan = create!(starts_on: starts_on, meal_count: meal_count, spoon_budget: spoon_budget)
      result.recipes.each_with_index do |recipe, position|
        plan.entries.create!(recipe: recipe, position: position)
      end
      plan
    end
  end

  def total_spoons
    recipes.sum(&:spoons)
  end

  def meals_planned
    recipes.sum(&:meals_covered)
  end
end
