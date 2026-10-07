class ShoppingListsController < InertiaController
  def show
    meal_plan = MealPlan.find(params[:meal_plan_id])
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
end
