class MealPlan < ApplicationRecord
  include RecipeTotals

  DEFAULT_MEAL_COUNT = 14

  belongs_to :user

  has_many :entries, -> { order(:position) }, class_name: "MealPlanEntry", dependent: :destroy
  has_many :recipes, through: :entries
  has_many :shopping_list_checks, dependent: :delete_all

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
      result = planner(random).call
      result.recipes.each_with_index do |recipe, position|
        entries.create!(recipe: recipe, position: position)
      end
    end
    entries.reset
    true
  end

  # A random recipe to swap in for one entry, following this plan's rules.
  # Returns nil if no other recipe fits.
  def replacement_for(entry, random: Random.new)
    others = entries.where.not(id: entry.id).includes(:recipe).map(&:recipe)
    planner(random).pick_replacement(others: others, replacing: entry.recipe)
  end

  def shopping_list
    ShoppingList.new(self)
  end

  private

  def planner(random)
    MealPlanner.new(
      recipes: user.recipes.included_in_plans.to_a,
      meal_count: meal_count,
      spoon_budget: spoon_budget,
      max_spoons: max_spoons,
      budget_is_ceiling: budget_is_ceiling,
      # Only other plans count as "recently made", not this one.
      last_made_on: user.last_made_on_by_recipe(except: self),
      today: starts_on,
      random: random
    )
  end
end
