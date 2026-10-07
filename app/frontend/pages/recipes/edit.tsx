import { Head, router } from '@inertiajs/react'

import RecipeForm from '@/components/RecipeForm'
import { dangerButton } from '@/components/ui'
import type { Recipe } from '@/types'

export default function EditRecipe({ recipe }: { recipe: Recipe }) {
  function handleDelete() {
    if (window.confirm(`Delete ${recipe.name}?`)) {
      router.delete(`/recipes/${recipe.id}`)
    }
  }

  return (
    <>
      <Head title={`Edit ${recipe.name}`} />
      <h1 className="mb-6 text-2xl font-bold">Edit recipe</h1>
      <RecipeForm
        recipe={recipe}
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
