# Everything to buy for a meal plan: one item per ingredient across all its
# recipes, with each recipe's amount listed (amounts are free text, so they
# aren't added up).
class ShoppingList
  Use = Data.define(:recipe_name, :amount, :times)
  Item = Data.define(:ingredient_id, :name, :uses, :checked)

  def initialize(meal_plan)
    @meal_plan = meal_plan
  end

  # Items sorted by name, unchecked ones first.
  def items
    checked_ids = @meal_plan.shopping_list_checks.pluck(:ingredient_id).to_set

    lines_by_ingredient.map do |ingredient, uses|
      Item.new(ingredient_id: ingredient.id, name: ingredient.name, uses: uses,
               checked: checked_ids.include?(ingredient.id))
    end.sort_by { |item| [ item.checked ? 1 : 0, item.name.downcase ] }
  end

  # Recipes in the plan that don't list any ingredients yet (0-spoon fillers excluded).
  def recipes_without_ingredients
    planned_recipes.uniq.reject { |recipe| recipe.filler? || recipe.recipe_ingredients.any? }
  end

  private

  def planned_recipes
    @planned_recipes ||= @meal_plan.entries.includes(recipe: { recipe_ingredients: :ingredient }).map(&:recipe)
  end

  # { ingredient => [Use, ...] } in plan order. A recipe planned twice counts its amount twice ("times: 2").
  def lines_by_ingredient
    times_planned = planned_recipes.tally
    times_planned.keys.each_with_object(Hash.new { |hash, key| hash[key] = [] }) do |recipe, grouped|
      recipe.recipe_ingredients.each do |line|
        grouped[line.ingredient] << Use.new(recipe_name: recipe.name, amount: line.amount, times: times_planned[recipe])
      end
    end
  end
end
