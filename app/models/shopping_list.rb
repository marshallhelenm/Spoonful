# Everything to buy for a meal plan: one item per ingredient across all its
# recipes, with each recipe's amount listed (amounts are free text, so they
# aren't added up).
class ShoppingList
  Use = Data.define(:recipe_name, :amount, :times)
  Item = Data.define(:ingredient_id, :name, :uses, :checked)

  def initialize(meal_plan)
    @meal_plan = meal_plan
  end

  # Items sorted by name. (The page splits them into "to buy" and "in your
  # cart" itself, since checkmarks change on screen before the server hears.)
  def items
    checked_ids = @meal_plan.shopping_list_checks.pluck(:ingredient_id).to_set

    lines_by_ingredient.map do |ingredient, uses|
      Item.new(ingredient_id: ingredient.id, name: ingredient.name, uses: uses,
               checked: checked_ids.include?(ingredient.id))
    end.sort_by { |item| item.name.downcase }
  end

  # Recipes in the plan that don't list any ingredients yet (0-spoon fillers excluded).
  def recipes_without_ingredients
    planned_recipes.uniq.reject { |recipe| recipe.filler? || recipe.recipe_ingredients.any? }
  end

  # The plan's recipes, then every item as a Markdown task list (checked items
  # ticked), for copying into another app or printing.
  def to_markdown
    recipes = planned_recipes.tally.map { |recipe, times| "- #{with_times(recipe.name, times)}" }
    ingredients = items.map { |item| "- [#{item.checked ? "x" : " "}] #{describe(item)}" }

    [
      "# Shopping list: week of #{@meal_plan.starts_on.strftime("%B %-d, %Y")}",
      "## Recipes\n\n#{recipes.any? ? recipes.join("\n") : "None yet."}",
      "## Ingredients\n\n#{ingredients.any? ? ingredients.join("\n") : "Nothing to buy."}"
    ].join("\n\n") + "\n"
  end

  private

  # Amounts without recipe names, to keep the shared list short. An ingredient
  # in several recipes says how many: "Garlic — 6 cloves · 2 cloves (2 recipes)".
  def describe(item)
    amounts = item.uses.filter_map { |use| with_times(use.amount, use.times) if use.amount.present? }
    text = amounts.any? ? "#{item.name} — #{amounts.join(" · ")}" : item.name
    item.uses.size > 1 ? "#{text} (#{item.uses.size} recipes)" : text
  end

  def with_times(name, times)
    times > 1 ? "#{name} ×#{times}" : name
  end

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
