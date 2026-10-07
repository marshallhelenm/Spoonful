# Picks recipes for a meal plan that fills `meal_count` meals while landing as
# close as possible to `spoon_budget` (a target, not a cap).
#
# Approach: build many random candidate plans and keep the one closest to the
# budget. Each draw is weighted by
#   - recency: recipes made recently are less likely (but never impossible), and
#   - fit: recipes whose spoons match the remaining budget per meal are likelier,
# so candidates cluster near the target instead of being pure luck.
#
# An optional `max_spoons` cap excludes any recipe harder than that.
# With `budget_is_ceiling`, the total never goes over the budget: recipes that
# would push past it are skipped, even if that leaves meals unfilled.
#
# Pure Ruby, no database access: callers pass recipes and last-made dates in.
class MealPlanner
  Result = Data.define(:recipes) do
    def total_spoons = recipes.sum(&:spoons)
    def meals_planned = recipes.sum(&:meals_covered)
  end

  DEFAULT_ATTEMPTS = 300
  # A recipe made this many days ago (or never) gets full weight.
  FULL_WEIGHT_AFTER_DAYS = 28
  # Floor so recently made recipes can still be picked.
  MIN_RECENCY_WEIGHT = 0.1
  # How strongly to avoid picks that blow past the remaining budget.
  OVERSHOOT_PENALTY = 2
  # Single-meal swaps use a gentler budget fit so "random" still feels random.
  REPLACEMENT_FIT_SOFTNESS = 2.0
  # How strongly single-meal swaps prefer recipes covering the same number of meals.
  MEALS_MATCH_STRENGTH = 1.0

  def initialize(recipes:, meal_count:, spoon_budget:, max_spoons: nil, budget_is_ceiling: false,
                 last_made_on: {}, today: Date.current, attempts: DEFAULT_ATTEMPTS, random: Random.new)
    @recipes = max_spoons ? recipes.select { |recipe| recipe.spoons <= max_spoons } : recipes
    @meal_count = meal_count
    @spoon_budget = spoon_budget
    @budget_is_ceiling = budget_is_ceiling
    @today = today
    @attempts = attempts
    @random = random
    @recency_weights = @recipes.to_h { |recipe| [ recipe.id, recency_weight(last_made_on[recipe.id]) ] }
  end

  def call
    best = nil
    @attempts.times do
      candidate = build_candidate
      best = candidate if best.nil? || distance(candidate) < distance(best)
      break if distance(best).zero?
    end
    best || Result.new(recipes: [])
  end

  # Picks one recipe to swap in for `replacing`, given the rest of the plan
  # (`others`). Follows the same rules as a full plan: no repeated non-fillers,
  # the spoon cap, and the ceiling if set. Prefers recipes that cover as many
  # meals as the one being replaced. Returns nil if nothing else fits.
  def pick_replacement(others:, replacing:)
    target = @spoon_budget - others.sum(&:spoons)
    candidates = allowed(used_ids: others.to_set(&:id), spoons_left: target).reject { it.id == replacing.id }
    return if candidates.empty?

    weighted_pick(candidates, candidates.map do |recipe|
      budget_fit = Math.exp(-(recipe.spoons - target).abs / REPLACEMENT_FIT_SOFTNESS)
      meals_match = Math.exp(-(recipe.meals_covered - replacing.meals_covered).abs * MEALS_MATCH_STRENGTH)
      @recency_weights.fetch(recipe.id) * budget_fit * meals_match
    end)
  end

  private

  def build_candidate
    picks = []
    used_ids = Set.new
    meals_left = @meal_count
    spoons_left = @spoon_budget

    while meals_left.positive?
      available = allowed(used_ids: used_ids, spoons_left: spoons_left)
      break if available.empty?

      recipe = weighted_pick(available, available.map do |candidate|
        @recency_weights.fetch(candidate.id) * fit_weight(candidate, meals_left, spoons_left)
      end)
      picks << recipe
      used_ids << recipe.id
      meals_left -= recipe.meals_covered # may go negative: the extra meals are leftovers
      spoons_left -= recipe.spoons
    end

    Result.new(recipes: picks)
  end

  # Recipes that can go in next: nothing already used (0-spoon fillers may
  # repeat), and with a ceiling budget, nothing that would go over it.
  def allowed(used_ids:, spoons_left:)
    @recipes.select do |recipe|
      (recipe.filler? || !used_ids.include?(recipe.id)) &&
        !(@budget_is_ceiling && recipe.spoons > spoons_left)
    end
  end

  def weighted_pick(items, weights)
    target = @random.rand * weights.sum
    items.zip(weights).each do |item, weight|
      target -= weight
      return item if target <= 0
    end
    items.last
  end

  # How well this recipe's spoons match its share of the remaining budget,
  # with an extra penalty for overshooting what's left of the budget.
  def fit_weight(recipe, meals_left, spoons_left)
    fair_share = spoons_left.to_f * [ recipe.meals_covered, meals_left ].min / meals_left
    overshoot = [ recipe.spoons - spoons_left, 0 ].max
    Math.exp(-(recipe.spoons - fair_share).abs - (OVERSHOOT_PENALTY * overshoot))
  end

  def recency_weight(last_made_on)
    return 1.0 if last_made_on.nil?

    days_ago = (@today - last_made_on).to_i
    (days_ago.to_f / FULL_WEIGHT_AFTER_DAYS).clamp(MIN_RECENCY_WEIGHT, 1.0)
  end

  def distance(result)
    (result.total_spoons - @spoon_budget).abs
  end
end
