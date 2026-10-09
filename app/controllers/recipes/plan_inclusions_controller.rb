# Puts a recipe back in the pool the planner picks from, or leaves it out
# (the quick toggle on the recipe list).
class Recipes::PlanInclusionsController < InertiaController
  def update
    recipe = Current.user.recipes.find(params[:recipe_id])
    recipe.update!(include_in_plans: params.expect(:included))

    redirect_to recipes_path
  end
end
