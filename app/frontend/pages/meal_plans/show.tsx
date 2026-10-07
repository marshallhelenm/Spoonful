import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'

import Spoons from '@/components/Spoons'
import { card, dangerButton, primaryButton } from '@/components/ui'
import { formatDate, pluralize } from '@/lib/format'
import type { MealPlan, MealPlanEntry } from '@/types'

function budgetStatus(total: number, budget: number) {
  const difference = total - budget
  if (difference === 0) return { text: 'Right on budget', tone: 'text-emerald-700' }
  if (difference < 0) return { text: `${pluralize(-difference, 'spoon')} under budget`, tone: 'text-emerald-700' }
  return { text: `${pluralize(difference, 'spoon')} over budget`, tone: 'text-amber-800' }
}

function mealsStatus(planned: number, wanted: number) {
  if (planned === wanted) return null
  if (planned > wanted) return `${pluralize(planned - wanted, 'meal')} of leftovers`
  return `${pluralize(wanted - planned, 'meal')} short. Add more recipes to fill the week.`
}

type FillerGroup = { entry: MealPlanEntry; count: number }

// Cooked meals keep their plan order; 0-spoon fillers (which can repeat) are
// collapsed into one row per recipe, most frequent first.
function groupEntries(entries: MealPlanEntry[]) {
  const cooked = entries.filter((entry) => entry.spoons > 0)
  const fillers = new Map<number, FillerGroup>()
  for (const entry of entries) {
    if (entry.spoons > 0) continue
    const group = fillers.get(entry.id)
    if (group) group.count += 1
    else fillers.set(entry.id, { entry, count: 1 })
  }
  return { cooked, fillers: [...fillers.values()].sort((a, b) => b.count - a.count) }
}

export default function ShowMealPlan({ meal_plan: plan }: { meal_plan: MealPlan }) {
  const [reshuffling, setReshuffling] = useState(false)
  const budget = budgetStatus(plan.total_spoons, plan.spoon_budget)
  const meals = mealsStatus(plan.meals_planned, plan.meal_count)
  const { cooked, fillers } = groupEntries(plan.entries)

  function reshuffle() {
    router.post(`/meal_plans/${plan.id}/reshuffle`, {}, {
      preserveScroll: true,
      onStart: () => setReshuffling(true),
      onFinish: () => setReshuffling(false),
    })
  }

  function handleDelete() {
    if (window.confirm('Delete this meal plan?')) {
      router.delete(`/meal_plans/${plan.id}`)
    }
  }

  return (
    <>
      <Head title={`Week of ${formatDate(plan.starts_on)}`} />
      <h1 className="text-2xl font-bold">Week of {formatDate(plan.starts_on)}</h1>
      {(plan.budget_is_ceiling || plan.max_spoons !== null) && (
        <p className="mt-1 text-sm text-stone-600">
          {[
            plan.budget_is_ceiling && 'Never over budget',
            plan.max_spoons !== null && `No meal harder than ${pluralize(plan.max_spoons, 'spoon')}`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className={card}>
          <dt className="text-sm text-stone-600">Spoons</dt>
          <dd className="mt-1 text-2xl font-bold">
            {plan.total_spoons}
            <span className="text-base font-medium text-stone-500"> / {plan.spoon_budget}</span>
          </dd>
          <dd className={`mt-1 text-sm font-medium ${budget.tone}`}>{budget.text}</dd>
        </div>
        <div className={card}>
          <dt className="text-sm text-stone-600">Meals</dt>
          <dd className="mt-1 text-2xl font-bold">
            {plan.meals_planned}
            <span className="text-base font-medium text-stone-500"> / {plan.meal_count}</span>
          </dd>
          {meals && <dd className="mt-1 text-sm font-medium text-stone-700">{meals}</dd>}
        </div>
      </dl>

      {plan.entries.length === 0 ? (
        <div className={`${card} mt-6 text-stone-700`}>
          No recipes could be picked.{' '}
          <Link href="/recipes/new" className="font-semibold text-amber-800 underline">
            Add some recipes
          </Link>{' '}
          and reshuffle.
        </div>
      ) : (
        <>
          {cooked.length > 0 && (
            <section aria-labelledby="cooked-heading" className="mt-6">
              <h2 id="cooked-heading" className="mb-2 text-lg font-semibold">
                To cook
              </h2>
              <ol className="space-y-2">
                {cooked.map((entry) => (
                  <li key={entry.entry_id} className={`${card} flex items-center justify-between gap-3`}>
                    <div>
                      <p className="font-semibold">{entry.name}</p>
                      {entry.meals_covered > 1 && (
                        <p className="text-sm text-stone-600">Covers {pluralize(entry.meals_covered, 'meal')}</p>
                      )}
                    </div>
                    <Spoons count={entry.spoons} />
                  </li>
                ))}
              </ol>
            </section>
          )}

          {fillers.length > 0 && (
            <section aria-labelledby="fillers-heading" className="mt-6">
              <h2 id="fillers-heading" className="mb-2 text-lg font-semibold">
                No-effort meals
              </h2>
              <ul className="space-y-2">
                {fillers.map(({ entry, count }) => (
                  <li key={entry.id} className={`${card} flex items-center justify-between gap-3`}>
                    <p className="font-semibold">{entry.name}</p>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
                      <span className="sr-only">{pluralize(count * entry.meals_covered, 'meal')}</span>
                      <span aria-hidden="true">× {count * entry.meals_covered}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={reshuffle} disabled={reshuffling} className={primaryButton}>
          {reshuffling ? 'Reshuffling…' : 'Reshuffle'}
        </button>
        <button type="button" onClick={handleDelete} className={`${dangerButton} ml-auto`}>
          Delete plan
        </button>
      </div>
    </>
  )
}
