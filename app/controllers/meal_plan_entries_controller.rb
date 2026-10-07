# Changes to a single meal in a plan: swap in a chosen recipe, swap in a random
# one, or remove it.
class MealPlanEntriesController < InertiaController
  before_action :set_entry

  def update
    recipe = Current.user.recipes.find(params.expect(meal_plan_entry: [ :recipe_id ])[:recipe_id])
    replaced = @entry.recipe
    @entry.update!(recipe: recipe)
    redirect_to meal_plan_path(@meal_plan), notice: "Swapped #{replaced.name} for #{recipe.name}."
  end

  def shuffle
    replaced = @entry.recipe
    recipe = @meal_plan.replacement_for(@entry)

    if recipe
      @entry.update!(recipe: recipe)
      redirect_to meal_plan_path(@meal_plan), notice: "Swapped #{replaced.name} for #{recipe.name}."
    else
      redirect_to meal_plan_path(@meal_plan), alert: "No other recipes fit this plan's rules."
    end
  end

  def destroy
    @entry.destroy
    redirect_to meal_plan_path(@meal_plan), notice: "Removed #{@entry.recipe.name}."
  end

  private

  def set_entry
    @meal_plan = Current.user.meal_plans.find(params[:meal_plan_id])
    @entry = @meal_plan.entries.find(params[:id])
  end
end
