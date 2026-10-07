class RecipesController < InertiaController
  before_action :set_recipe, only: %i[edit update destroy]

  def index
    last_made_on = MealPlanEntry.last_made_on_by_recipe
    ingredient_counts = RecipeIngredient.group(:recipe_id).count

    render inertia: {
      recipes: Recipe.order(:name).map do |recipe|
        serialize(recipe).merge(
          last_made_on: last_made_on[recipe.id],
          ingredient_count: ingredient_counts.fetch(recipe.id, 0)
        )
      end
    }
  end

  def new
    render inertia: form_props(Recipe.new)
  end

  def create
    recipe = Recipe.new(recipe_params)

    if recipe.save_with_ingredients(ingredient_lines_param)
      redirect_to recipes_path, notice: "Added #{recipe.name}."
    else
      redirect_to new_recipe_path, inertia: { errors: recipe.errors }
    end
  end

  def edit
    render inertia: form_props(@recipe)
  end

  def update
    @recipe.assign_attributes(recipe_params)

    if @recipe.save_with_ingredients(ingredient_lines_param)
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

  # [{ name:, amount: }, ...] from the form, or nil when the request doesn't
  # mention ingredients at all (so they're left unchanged).
  def ingredient_lines_param
    recipe = params.fetch(:recipe, {})
    return unless recipe.key?(:ingredients)

    recipe.permit(ingredients: %i[name amount])[:ingredients] || []
  end

  def form_props(recipe)
    {
      recipe: serialize(recipe).merge(ingredients: recipe.ingredient_lines),
      # Every saved ingredient name, for suggestions while typing.
      ingredient_names: Ingredient.order(:name).pluck(:name)
    }
  end

  def serialize(recipe)
    recipe.as_json(only: %i[id name spoons meals_covered notes])
  end
end
