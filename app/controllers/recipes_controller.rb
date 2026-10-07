class RecipesController < InertiaController
  before_action :set_recipe, only: %i[edit update destroy]

  def index
    last_made_on = MealPlanEntry.last_made_on_by_recipe

    render inertia: {
      recipes: Recipe.order(:name).map { |recipe| serialize(recipe).merge(last_made_on: last_made_on[recipe.id]) }
    }
  end

  def new
    render inertia: { recipe: serialize(Recipe.new) }
  end

  def create
    recipe = Recipe.new(recipe_params)

    if recipe.save
      redirect_to recipes_path, notice: "Added #{recipe.name}."
    else
      redirect_to new_recipe_path, inertia: { errors: recipe.errors }
    end
  end

  def edit
    render inertia: { recipe: serialize(@recipe) }
  end

  def update
    if @recipe.update(recipe_params)
      redirect_to recipes_path, notice: "Saved #{@recipe.name}."
    else
      redirect_to edit_recipe_path(@recipe), inertia: { errors: @recipe.errors }
    end
  end

  def destroy
    if @recipe.destroy
      redirect_to recipes_path, notice: "Deleted #{@recipe.name}."
    else
      redirect_to edit_recipe_path(@recipe),
                  alert: "#{@recipe.name} is part of a saved meal plan, so it can't be deleted."
    end
  end

  private

  def set_recipe
    @recipe = Recipe.find(params[:id])
  end

  def recipe_params
    params.expect(recipe: %i[name spoons meals_covered notes])
  end

  def serialize(recipe)
    recipe.as_json(only: %i[id name spoons meals_covered notes])
  end
end
