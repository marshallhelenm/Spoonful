# Totals for anything with a list of `recipes` (a saved MealPlan, or a
# MealPlanner result). A recipe listed twice counts twice.
module RecipeTotals
  # A recipe's spoons count once per use, however many meals it covers.
  def total_spoons
    recipes.sum(&:spoons)
  end

  def meals_planned
    recipes.sum(&:meals_covered)
  end
end
