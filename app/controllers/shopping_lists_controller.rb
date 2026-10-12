class ShoppingListsController < InertiaController
  def show
    list = meal_plan.shopping_list

    render inertia: {
      meal_plan: meal_plan.as_json(only: %i[id starts_on]),
      items: list.items.map do |item|
        {
          ingredient_id: item.ingredient_id,
          name: item.name,
          checked: item.checked,
          uses: item.uses.map(&:to_h)
        }
      end,
      recipes_without_ingredients: list.recipes_without_ingredients.as_json(only: %i[id name])
    }
  end

  # The list as Markdown, to copy or print.
  def share
    render inertia: {
      meal_plan: meal_plan.as_json(only: %i[id starts_on]),
      markdown: meal_plan.shopping_list.to_markdown
    }
  end

  private

  def meal_plan
    @meal_plan ||= Current.user.meal_plans.find(params[:meal_plan_id])
  end
end
