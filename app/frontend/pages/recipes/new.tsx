import { Head } from '@inertiajs/react'

import RecipeForm from '@/components/RecipeForm'
import type { Recipe } from '@/types'

export default function NewRecipe({ recipe }: { recipe: Partial<Recipe> }) {
  return (
    <>
      <Head title="Add recipe" />
      <h1 className="mb-6 text-2xl font-bold">Add a recipe</h1>
      <RecipeForm recipe={recipe} submitLabel="Add recipe" onSubmit={(form) => form.post('/recipes')} />
    </>
  )
}
