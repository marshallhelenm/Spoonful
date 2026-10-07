# Tidying the shared ingredient list: rename, merge duplicates, delete unused.
class IngredientsController < InertiaController
  before_action :set_ingredient, only: %i[update destroy merge]

  def index
    ingredients = Current.user.ingredients.includes(:recipes).order(Arel.sql("lower(name)"))

    render inertia: {
      ingredients: ingredients.map do |ingredient|
        ingredient.as_json(only: %i[id name]).merge(
          recipes: ingredient.recipes.uniq.sort_by(&:name).map { it.as_json(only: %i[id name]) }
        )
      end
    }
  end

  def update
    new_name = params.expect(ingredient: [ :name ])[:name]
    old_name = @ingredient.name

    if @ingredient.update(name: new_name)
      redirect_to ingredients_path, notice: "Renamed #{old_name} to #{@ingredient.name}."
    else
      redirect_to ingredients_path, inertia: { errors: rename_errors }
    end
  end

  def merge
    target = Current.user.ingredients.find(params.expect(:target_id))

    if target == @ingredient
      redirect_to ingredients_path, alert: "Pick a different ingredient to merge into."
    else
      @ingredient.merge_into!(target)
      redirect_to ingredients_path, notice: "Merged #{@ingredient.name} into #{target.name}."
    end
  end

  def destroy
    if @ingredient.destroy
      redirect_to ingredients_path, notice: "Deleted #{@ingredient.name}."
    else
      redirect_to ingredients_path,
                  alert: "#{@ingredient.name} is used in a recipe. Merge it into another ingredient instead."
    end
  end

  private

  def set_ingredient
    @ingredient = Current.user.ingredients.find(params[:id])
  end

  # Turns "has already been taken" into a pointer toward merging, naming the
  # existing ingredient as it's actually spelled.
  def rename_errors
    if @ingredient.errors.of_kind?(:name, :taken)
      existing = Current.user.ingredients.where.not(id: @ingredient.id).named(@ingredient.name).first
      { name: [ "There's already an ingredient called #{existing.name}. Use “Merge into” to combine them." ] }
    else
      @ingredient.errors.to_hash
    end
  end
end
