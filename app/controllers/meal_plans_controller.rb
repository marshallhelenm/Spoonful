class MealPlansController < InertiaController
  before_action :set_meal_plan, only: %i[show reshuffle destroy]

  def index
    plans = MealPlan.includes(:recipes).order(starts_on: :desc, created_at: :desc)

    render inertia: { meal_plans: plans.map { |plan| summary(plan) } }
  end

  def new
    plan = MealPlan.new

    render inertia: {
      defaults: plan.as_json(only: %i[meal_count starts_on]),
      recipe_count: Recipe.count
    }
  end

  def create
    plan = MealPlan.new(meal_plan_params)

    if plan.save_and_fill
      redirect_to meal_plan_path(plan)
    else
      redirect_to new_meal_plan_path, inertia: { errors: plan.errors }
    end
  end

  def show
    render inertia: {
      meal_plan: summary(@meal_plan).merge(
        entries: @meal_plan.entries.includes(:recipe).map do |entry|
          entry.recipe.as_json(only: %i[id name spoons meals_covered]).merge(entry_id: entry.id)
        end
      )
    }
  end

  def reshuffle
    @meal_plan.fill!
    redirect_to meal_plan_path(@meal_plan), notice: "Reshuffled."
  end

  def destroy
    @meal_plan.destroy
    redirect_to meal_plans_path, notice: "Deleted the plan for the week of #{@meal_plan.starts_on.to_fs(:long)}."
  end

  private

  def set_meal_plan
    @meal_plan = MealPlan.find(params[:id])
  end

  def meal_plan_params
    params.expect(meal_plan: %i[spoon_budget meal_count starts_on max_spoons])
  end

  def summary(plan)
    plan.as_json(only: %i[id starts_on meal_count spoon_budget max_spoons]).merge(
      total_spoons: plan.total_spoons,
      meals_planned: plan.meals_planned
    )
  end
end
