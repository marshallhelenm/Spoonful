import { Link, useForm } from '@inertiajs/react'
import type { FormEvent, ReactNode } from 'react'

import FieldError from '@/components/FieldError'
import IngredientsEditor, { newIngredientRow } from '@/components/IngredientsEditor'
import NumberStepper from '@/components/NumberStepper'
import SpoonPicker from '@/components/SpoonPicker'
import { input, label, primaryButton, secondaryButton } from '@/components/ui'
import type { Recipe } from '@/types'

type Props = {
  recipe: Partial<Recipe>
  // Every saved ingredient name, for suggestions.
  ingredientNames: string[]
  submitLabel: string
  onSubmit: (form: ReturnType<typeof useRecipeForm>) => void
  extraActions?: ReactNode
}

export function useRecipeForm(recipe: Partial<Recipe>) {
  return useForm({
    name: recipe.name ?? '',
    spoons: recipe.spoons ?? (null as number | null),
    meals_covered: (recipe.meals_covered ?? 1) as number | '',
    notes: recipe.notes ?? '',
    ingredients: (recipe.ingredients ?? []).map((line) => newIngredientRow(line.name, line.amount ?? '')),
  })
}

export default function RecipeForm({ recipe, ingredientNames, submitLabel, onSubmit, extraActions }: Props) {
  const form = useRecipeForm(recipe)
  const { data, setData, errors, processing } = form

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    // Send everything under `recipe`, dropping empty ingredient rows and the client-only row ids.
    form.transform((data) => ({
      recipe: {
        ...data,
        ingredients: data.ingredients
          .filter((row) => row.name.trim() !== '')
          .map((row) => ({ name: row.name, amount: row.amount })),
      },
    }))
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label htmlFor="name" className={label}>
          Name
        </label>
        <input
          id="name"
          type="text"
          value={data.name}
          onChange={(event) => setData('name', event.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={input}
          autoComplete="off"
          required
        />
        <FieldError id="name-error" error={errors.name} />
      </div>

      <div>
        <span className={label}>Spoons</span>
        <p id="spoons-hint" className="text-sm text-muted">
          How much energy it takes, from 0 (takeout, leftovers) to 5 (a real project).
        </p>
        <SpoonPicker
          value={data.spoons}
          onChange={(value) => setData('spoons', value)}
          describedBy={errors.spoons ? 'spoons-hint spoons-error' : 'spoons-hint'}
        />
        <FieldError id="spoons-error" error={errors.spoons} />
      </div>

      <div>
        <label htmlFor="meals_covered" className={label}>
          Meals it makes
        </label>
        <NumberStepper
          id="meals_covered"
          value={data.meals_covered}
          onChange={(value) => setData('meals_covered', value)}
          min={1}
          describedBy={errors.meals_covered ? 'meals_covered-error' : undefined}
        />
        <FieldError id="meals_covered-error" error={errors.meals_covered} />
      </div>

      <fieldset>
        <legend className={label}>Ingredients</legend>
        <p className="mb-2 text-sm text-muted">One per line. Amounts are optional.</p>
        <IngredientsEditor
          rows={data.ingredients}
          onChange={(rows) => setData('ingredients', rows)}
          savedNames={ingredientNames}
        />
      </fieldset>

      <div>
        <label htmlFor="notes" className={label}>
          Notes <span className="font-medium text-subtle">(optional)</span>
        </label>
        <textarea
          id="notes"
          rows={4}
          value={data.notes}
          onChange={(event) => setData('notes', event.target.value)}
          className={input}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={processing} className={primaryButton}>
          {submitLabel}
        </button>
        <Link href="/recipes" className={secondaryButton}>
          Cancel
        </Link>
        {extraActions && <div className="ml-auto">{extraActions}</div>}
      </div>
    </form>
  )
}
