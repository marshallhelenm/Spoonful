import { Head, Link, useForm } from '@inertiajs/react'
import type { FormEvent } from 'react'

import FieldError from '@/components/FieldError'
import NumberStepper from '@/components/NumberStepper'
import { card, input, label, primaryButton } from '@/components/ui'

type Props = {
  defaults: { meal_count: number; starts_on: string }
  recipe_count: number
}

const BUDGET_PRESETS = [
  { label: 'Low', value: 5 },
  { label: 'Medium', value: 12 },
  { label: 'High', value: 20 },
]

export default function NewMealPlan({ defaults, recipe_count }: Props) {
  const { data, setData, post, errors, processing } = useForm({
    spoon_budget: '' as number | '',
    meal_count: defaults.meal_count as number | '',
    starts_on: defaults.starts_on,
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    post('/meal_plans')
  }

  return (
    <>
      <Head title="Plan your week" />
      <h1 className="text-2xl font-bold">How many spoons this week?</h1>
      <p className="mt-1 text-stone-600">
        Set a spoon budget and Spoonful will pick meals that add up to about that much effort.
      </p>

      {recipe_count === 0 && (
        <div className={`${card} mt-6 bg-amber-50 ring-amber-200`}>
          <p className="font-medium">You don't have any recipes yet.</p>
          <p className="mt-1 text-sm text-stone-700">
            <Link href="/recipes/new" className="font-semibold text-amber-800 underline">
              Add a few recipes
            </Link>{' '}
            first, including some 0-spoon meals for low-energy days.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${card} mt-6 space-y-6`} noValidate>
        <div>
          <label htmlFor="spoon_budget" className={label}>
            Spoon budget
          </label>
          <div className="mt-2 flex flex-wrap gap-2" aria-label="Budget presets">
            {BUDGET_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setData('spoon_budget', preset.value)}
                aria-pressed={data.spoon_budget === preset.value}
                className={`min-h-11 rounded-full px-4 text-sm font-medium ring-1 ${
                  data.spoon_budget === preset.value
                    ? 'bg-amber-700 text-white ring-amber-700'
                    : 'bg-white text-stone-700 ring-stone-300 hover:bg-stone-100'
                }`}
              >
                {preset.label} · {preset.value}
              </button>
            ))}
          </div>
          <NumberStepper
            id="spoon_budget"
            value={data.spoon_budget}
            onChange={(value) => setData('spoon_budget', value)}
            min={0}
            describedBy={errors.spoon_budget ? 'spoon_budget-error' : undefined}
          />
          <FieldError id="spoon_budget-error" error={errors.spoon_budget} />
        </div>

        <div>
          <label htmlFor="meal_count" className={label}>
            Meals to plan
          </label>
          <p id="meal_count-hint" className="text-sm text-stone-600">
            14 is lunch and dinner for a week.
          </p>
          <NumberStepper
            id="meal_count"
            value={data.meal_count}
            onChange={(value) => setData('meal_count', value)}
            min={1}
            describedBy={errors.meal_count ? 'meal_count-hint meal_count-error' : 'meal_count-hint'}
          />
          <FieldError id="meal_count-error" error={errors.meal_count} />
        </div>

        <div>
          <label htmlFor="starts_on" className={label}>
            Week starting
          </label>
          <input
            id="starts_on"
            type="date"
            value={data.starts_on}
            onChange={(event) => setData('starts_on', event.target.value)}
            aria-describedby={errors.starts_on ? 'starts_on-error' : undefined}
            className={`${input} sm:max-w-xs`}
          />
          <FieldError id="starts_on-error" error={errors.starts_on} />
        </div>

        <button type="submit" disabled={processing || recipe_count === 0} className={`${primaryButton} w-full sm:w-auto`}>
          Plan my week
        </button>
      </form>
    </>
  )
}
