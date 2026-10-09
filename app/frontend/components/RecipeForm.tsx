import { Link, useForm } from '@inertiajs/react'
import type { FormEvent, ReactNode } from 'react'

import Field from '@/components/Field'
import IngredientsEditor, { newIngredientRow } from '@/components/IngredientsEditor'
import NumberStepper from '@/components/NumberStepper'
import SpoonPicker from '@/components/SpoonPicker'
import { checkbox, input, label, primaryButton, secondaryButton } from '@/components/ui'
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
    include_in_plans: recipe.include_in_plans ?? true,
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
      <Field id="name" label="Name" error={errors.name}>
        {({ id, describedBy, invalid }) => (
          <input
            id={id}
            type="text"
            value={data.name}
            onChange={(event) => setData('name', event.target.value)}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={input}
            autoComplete="off"
            required
          />
        )}
      </Field>

      <Field
        id="spoons"
        label="Spoons"
        group
        hint="How much energy it takes, from 0 (takeout, leftovers) to 5 (a real project)."
        error={errors.spoons}
      >
        {({ describedBy, invalid }) => (
          <SpoonPicker
            value={data.spoons}
            onChange={(value) => setData('spoons', value)}
            describedBy={describedBy}
            invalid={invalid}
          />
        )}
      </Field>

      <Field id="meals_covered" label="Meals it makes" error={errors.meals_covered}>
        {({ id, describedBy, invalid }) => (
          <NumberStepper
            id={id}
            value={data.meals_covered}
            onChange={(value) => setData('meals_covered', value)}
            min={1}
            describedBy={describedBy}
            invalid={invalid}
          />
        )}
      </Field>

      <fieldset>
        <legend className={label}>Ingredients</legend>
        <p className="mb-2 text-sm text-muted">One per line. Amounts are optional.</p>
        <IngredientsEditor
          rows={data.ingredients}
          onChange={(rows) => setData('ingredients', rows)}
          savedNames={ingredientNames}
        />
      </fieldset>

      <Field
        id="notes"
        label={
          <>
            Notes <span className="font-medium text-subtle">(optional)</span>
          </>
        }
      >
        {({ id }) => (
          <textarea id={id} rows={4} value={data.notes} onChange={(event) => setData('notes', event.target.value)} className={input} />
        )}
      </Field>

      <div className="flex items-start gap-3">
        <input
          id="include_in_plans"
          type="checkbox"
          checked={data.include_in_plans}
          onChange={(event) => setData('include_in_plans', event.target.checked)}
          className={checkbox}
        />
        <label htmlFor="include_in_plans" className="text-sm">
          <span className="font-semibold text-ink">Include in meal plans</span>
          <span className="block text-muted">
            Turn this off to keep it out of planned and shuffled meals. You can still pick it by hand.
          </span>
        </label>
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
