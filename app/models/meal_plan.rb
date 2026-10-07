class MealPlan < ApplicationRecord
  DEFAULT_MEAL_COUNT = 14

  has_many :entries, -> { order(:position) }, class_name: "MealPlanEntry", dependent: :destroy
  has_many :recipes, through: :entries

  attribute :meal_count, default: DEFAULT_MEAL_COUNT
  attribute :starts_on, default: -> { Date.current }

  validates :starts_on, presence: true
  validates :meal_count, numericality: { only_integer: true, greater_than_or_equal_to: 1 }
  validates :spoon_budget, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :max_spoons, numericality: { only_integer: true, in: Recipe::SPOON_RANGE, allow_nil: true }

  # Saves the plan and picks its recipes. Returns false if the plan is invalid.
  def save_and_fill(random: Random.new)
    transaction do
      save && fill!(random: random)
    end
  end

  # (Re)picks recipes with MealPlanner, replacing any existing entries.
  def fill!(random: Random.new)
    transaction do
      entries.destroy_all
      result = MealPlanner.new(
        recipes: Recipe.all.to_a,
        meal_count: meal_count,
        spoon_budget: spoon_budget,
        max_spoons: max_spoons,
        last_made_on: MealPlanEntry.last_made_on_by_recipe,
        today: starts_on,
        random: random
      ).call
      result.recipes.each_with_index do |recipe, position|
        entries.create!(recipe: recipe, position: position)
      end
    end
    entries.reset
    true
  end

  def total_spoons
    recipes.sum(&:spoons)
  end

  def meals_planned
    recipes.sum(&:meals_covered)
  end
end
