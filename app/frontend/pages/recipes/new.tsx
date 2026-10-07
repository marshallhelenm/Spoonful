import { Head } from '@inertiajs/react'

import RecipeForm from '@/components/RecipeForm'
import { pageHeading } from '@/components/ui'
import type { Recipe } from '@/types'

type Props = {
  recipe: Partial<Recipe>
  ingredient_names: string[]
}

export default function NewRecipe({ recipe, ingredient_names }: Props) {
  return (
    <>
      <Head title="Add recipe" />
      <h1 className={`mb-6 ${pageHeading}`}>Add a recipe</h1>
      <RecipeForm
        recipe={recipe}
        ingredientNames={ingredient_names}
        submitLabel="Add recipe"
        onSubmit={(form) => form.post('/recipes')}
      />
    </>
  )
}
