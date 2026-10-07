# Checks an ingredient off (or back on) a meal plan's shopping list.
class ShoppingListItemsController < InertiaController
  def update
    meal_plan = MealPlan.find(params[:meal_plan_id])
    ingredient = Ingredient.find(params[:ingredient_id])
    checks = meal_plan.shopping_list_checks

    if ActiveModel::Type::Boolean.new.cast(params.expect(:checked))
      checks.find_or_create_by!(ingredient: ingredient)
    else
      checks.where(ingredient: ingredient).delete_all
    end

    redirect_to meal_plan_shopping_list_path(meal_plan)
  end
end
