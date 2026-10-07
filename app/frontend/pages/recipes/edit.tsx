import { Head, router } from '@inertiajs/react'

import RecipeForm from '@/components/RecipeForm'
import { dangerButton, pageHeading } from '@/components/ui'
import type { Recipe } from '@/types'

type Props = {
  recipe: Recipe
  ingredient_names: string[]
}

export default function EditRecipe({ recipe, ingredient_names }: Props) {
  function handleDelete() {
    if (window.confirm(`Delete ${recipe.name}?`)) {
      router.delete(`/recipes/${recipe.id}`)
    }
  }

  return (
    <>
      <Head title={`Edit ${recipe.name}`} />
      <h1 className={`mb-6 ${pageHeading}`}>Edit recipe</h1>
      <RecipeForm
        recipe={recipe}
        ingredientNames={ingredient_names}
        submitLabel="Save"
        onSubmit={(form) => form.patch(`/recipes/${recipe.id}`)}
        extraActions={
          <button type="button" onClick={handleDelete} className={dangerButton}>
            Delete
          </button>
        }
      />
    </>
  )
}
