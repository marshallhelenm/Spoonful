import { Link, useForm } from '@inertiajs/react'
import type { FormEvent, ReactNode } from 'react'

import FieldError from '@/components/FieldError'
import NumberStepper from '@/components/NumberStepper'
import SpoonPicker from '@/components/SpoonPicker'
import { input, label, primaryButton, secondaryButton } from '@/components/ui'
import type { Recipe } from '@/types'

type Props = {
  recipe: Partial<Recipe>
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
  })
}

export default function RecipeForm({ recipe, submitLabel, onSubmit, extraActions }: Props) {
  const form = useRecipeForm(recipe)
  const { data, setData, errors, processing } = form

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
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
        <p id="spoons-hint" className="text-sm text-stone-600">
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

      <div>
        <label htmlFor="notes" className={label}>
          Notes <span className="font-normal text-stone-500">(optional)</span>
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
