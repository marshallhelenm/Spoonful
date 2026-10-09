import { Head, Link, useForm } from '@inertiajs/react'
import { useState } from 'react'
import type { FormEvent } from 'react'

import Field from '@/components/Field'
import NumberStepper from '@/components/NumberStepper'
import SpoonPicker from '@/components/SpoonPicker'
import { callout, card, checkbox, choiceColors, input, pageHeading, primaryButton, textLink } from '@/components/ui'

type Props = {
  defaults: { meal_count: number; starts_on: string }
  recipe_count: number
  // Recipes the planner may pick (the rest are left out of meal plans).
  included_recipe_count: number
}

const MEDIUM_BUDGET = 6

const BUDGET_PRESETS = [
  { label: 'Low', value: 3 },
  { label: 'Medium', value: MEDIUM_BUDGET },
  { label: 'High', value: 10 },
]

const DEFAULT_CAP = 3

export default function NewMealPlan({ defaults, recipe_count, included_recipe_count }: Props) {
  const { data, setData, post, errors, processing } = useForm({
    spoon_budget: MEDIUM_BUDGET as number | '',
    meal_count: defaults.meal_count as number | '',
    starts_on: defaults.starts_on,
    max_spoons: null as number | null,
    budget_is_ceiling: false,
  })
  const capEnabled = data.max_spoons !== null

  // The two budget rules start hidden under "More options". While collapsed,
  // the toggle lists whichever are on so they're never silently in effect.
  const [optionsOpen, setOptionsOpen] = useState(false)
  const showOptions = optionsOpen || Boolean(errors.max_spoons)
  const activeOptions = [
    data.budget_is_ceiling && 'Never over budget',
    capEnabled && `Hardest meal: ${data.max_spoons} ${data.max_spoons === 1 ? 'spoon' : 'spoons'}`,
  ].filter(Boolean)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    post('/meal_plans')
  }

  return (
    <>
      <Head title="Plan your week" />
      <h1 className={pageHeading}>How many spoons this week?</h1>
      <p className="mt-1 text-muted">
        Set a spoon budget and Spoonful will pick meals that add up to about that much effort.
      </p>

      {recipe_count === 0 ? (
        <div className={`${callout} mt-6`}>
          <p className="font-semibold">You don't have any recipes yet.</p>
          <p className="mt-1 text-sm text-ink-soft">
            <Link href="/recipes/new" className={textLink}>
              Add a few recipes
            </Link>{' '}
            first, including some 0-spoon meals for low-energy days.
          </p>
        </div>
      ) : (
        included_recipe_count === 0 && (
          <div className={`${callout} mt-6`}>
            <p className="font-semibold">All your recipes are left out of meal plans.</p>
            <p className="mt-1 text-sm text-ink-soft">
              Turn on "Include in meal plans" for a few{' '}
              <Link href="/recipes" className={textLink}>
                recipes
              </Link>{' '}
              so Spoonful has something to pick.
            </p>
          </div>
        )
      )}

      <form onSubmit={handleSubmit} className={`${card} mt-6 space-y-6`} noValidate>
        <Field id="spoon_budget" label="Spoon budget" error={errors.spoon_budget}>
          {({ id, describedBy, invalid }) => (
            <>
              <div className="mt-2 flex flex-wrap gap-2 mb-2" aria-label="Budget presets">
                {BUDGET_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setData('spoon_budget', preset.value)}
                    aria-pressed={data.spoon_budget === preset.value}
                    className={`min-h-11 rounded-full px-4 text-sm font-medium ring-1 ${choiceColors(data.spoon_budget === preset.value)}`}
                  >
                    {preset.label} · {preset.value}
                  </button>
                ))}
              </div>
              <NumberStepper
                id={id}
                value={data.spoon_budget}
                onChange={(value) => setData('spoon_budget', value)}
                min={0}
                describedBy={describedBy}
                invalid={invalid}
              />
            </>
          )}
        </Field>

        <Field id="meal_count" label="Meals to plan" hint="7 is dinner for a week." error={errors.meal_count}>
          {({ id, describedBy, invalid }) => (
            <NumberStepper
              id={id}
              value={data.meal_count}
              onChange={(value) => setData('meal_count', value)}
              min={1}
              describedBy={describedBy}
              invalid={invalid}
            />
          )}
        </Field>

        <Field id="starts_on" label="Week starting" error={errors.starts_on}>
          {({ id, describedBy, invalid }) => (
            <input
              id={id}
              type="date"
              value={data.starts_on}
              onChange={(event) => setData('starts_on', event.target.value)}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={`${input} sm:max-w-xs`}
            />
          )}
        </Field>

        <div>
          <button
            type="button"
            onClick={() => setOptionsOpen((open) => !open)}
            aria-expanded={showOptions}
            aria-controls="plan-options"
            className="-mx-2 flex min-h-11 items-start gap-2 rounded-lg px-2 py-3 text-left text-sm hover:bg-surface-hover"
          >
            <span aria-hidden="true" className={`text-accent-ink transition ${showOptions ? 'rotate-90' : ''}`}>
              ▸
            </span>
            <span>
              <span className="font-semibold text-accent-ink">More options</span>
              {!showOptions && activeOptions.length > 0 && (
                <span className="block text-muted">{activeOptions.join(' · ')}</span>
              )}
            </span>
          </button>

          {showOptions && (
            <div id="plan-options" className="mt-3 space-y-6">
              <div className="flex items-start gap-3">
                <input
                  id="budget_is_ceiling"
                  type="checkbox"
                  checked={data.budget_is_ceiling}
                  onChange={(event) => setData('budget_is_ceiling', event.target.checked)}
                  className={checkbox}
                />
                <label htmlFor="budget_is_ceiling" className="text-sm">
                  <span className="font-semibold text-ink">Never go over this budget</span>
                  <span className="block text-muted">
                    Otherwise Spoonful may go a little over if that gets closer to the budget.
                  </span>
                </label>
              </div>

              <div>
                <div className="flex items-start gap-3">
                  <input
                    id="cap_enabled"
                    type="checkbox"
                    checked={capEnabled}
                    onChange={(event) => setData('max_spoons', event.target.checked ? DEFAULT_CAP : null)}
                    className={checkbox}
                  />
                  <label htmlFor="cap_enabled" className="text-sm">
                    <span className="font-semibold text-ink">Limit how hard any one meal can be</span>
                    <span className="block text-muted">
                      Leave this off if one big cooking day is fine this week.
                    </span>
                  </label>
                </div>
                {capEnabled && (
                  <Field id="max_spoons" label="Hardest meal allowed" group error={errors.max_spoons} className="mt-3">
                    {({ describedBy, invalid }) => (
                      <SpoonPicker
                        label="Hardest meal allowed, in spoons"
                        value={data.max_spoons}
                        onChange={(value) => setData('max_spoons', value)}
                        describedBy={describedBy}
                        invalid={invalid}
                      />
                    )}
                  </Field>
                )}
              </div>
            </div>
          )}
        </div>

        <button type="submit" disabled={processing || included_recipe_count === 0} className={`${primaryButton} w-full sm:w-auto`}>
          Plan my week
        </button>
      </form>
    </>
  )
}
