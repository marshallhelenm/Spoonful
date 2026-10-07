import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'

import MealRow from '@/components/MealRow'
import Spoons from '@/components/Spoons'
import { card, dangerButton, pageHeading, primaryButton, secondaryButton } from '@/components/ui'
import { formatDate, pluralize } from '@/lib/format'
import type { MealPlan, MealPlanEntry, RecipeOption } from '@/types'

function budgetStatus(total: number, budget: number) {
  const difference = total - budget
  if (difference === 0) return { text: 'Right on budget', tone: 'text-success' }
  if (difference < 0) return { text: `${pluralize(-difference, 'spoon')} under budget`, tone: 'text-success' }
  return { text: `${pluralize(difference, 'spoon')} over budget`, tone: 'text-accent-ink' }
}

function mealsStatus(planned: number, wanted: number) {
  if (planned === wanted) return null
  if (planned > wanted) return `${pluralize(planned - wanted, 'meal')} of leftovers`
  return `${pluralize(wanted - planned, 'meal')} short`
}

type FillerGroup = { entry: MealPlanEntry; entryIds: number[] }

// Cooked meals keep their plan order; 0-spoon fillers (which can repeat) are
// collapsed into one row per recipe, most frequent first.
function groupEntries(entries: MealPlanEntry[]) {
  const cooked = entries.filter((entry) => entry.spoons > 0)
  const fillers = new Map<number, FillerGroup>()
  for (const entry of entries) {
    if (entry.spoons > 0) continue
    const group = fillers.get(entry.id)
    if (group) group.entryIds.push(entry.entry_id)
    else fillers.set(entry.id, { entry, entryIds: [entry.entry_id] })
  }
  return { cooked, fillers: [...fillers.values()].sort((a, b) => b.entryIds.length - a.entryIds.length) }
}

type Props = {
  meal_plan: MealPlan
  recipes: RecipeOption[]
}

export default function ShowMealPlan({ meal_plan: plan, recipes }: Props) {
  const [reshuffling, setReshuffling] = useState(false)
  // Which row's "Change" panel is open, if any.
  const [openRow, setOpenRow] = useState<string | null>(null)
  const toggleRow = (key: string) => setOpenRow((current) => (current === key ? null : key))
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
      <h1 className={pageHeading}>Week of {formatDate(plan.starts_on)}</h1>
      {(plan.budget_is_ceiling || plan.max_spoons !== null) && (
        <p className="mt-1 text-sm text-muted">
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
          <dt className="text-sm text-muted">Spoons</dt>
          <dd className="mt-1 text-2xl font-bold">
            {plan.total_spoons}
            <span className="text-base font-medium text-subtle"> / {plan.spoon_budget}</span>
          </dd>
          <dd className={`mt-1 text-sm font-semibold ${budget.tone}`}>{budget.text}</dd>
        </div>
        <div className={card}>
          <dt className="text-sm text-muted">Meals</dt>
          <dd className="mt-1 text-2xl font-bold">
            {plan.meals_planned}
            <span className="text-base font-medium text-subtle"> / {plan.meal_count}</span>
          </dd>
          {meals && <dd className="mt-1 text-sm font-semibold text-ink-soft">{meals}</dd>}
        </div>
      </dl>

      <Link href={`/meal_plans/${plan.id}/shopping_list`} className={`${secondaryButton} mt-4 w-full sm:w-auto`}>
        <span aria-hidden="true">🛒</span> Shopping list
      </Link>

      {plan.entries.length === 0 ? (
        <div className={`${card} mt-6 text-ink-soft`}>
          No recipes could be picked.{' '}
          <Link href="/recipes/new" className="font-semibold text-accent-ink underline">
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
                {cooked.map((entry) => {
                  const key = `entry-${entry.entry_id}`
                  return (
                    <MealRow
                      key={key}
                      planId={plan.id}
                      entryId={entry.entry_id}
                      recipeId={entry.id}
                      name={entry.name}
                      details={entry.meals_covered > 1 ? `Covers ${pluralize(entry.meals_covered, 'meal')}` : undefined}
                      aside={<Spoons count={entry.spoons} />}
                      recipes={recipes}
                      maxSpoons={plan.max_spoons}
                      open={openRow === key}
                      onToggle={() => toggleRow(key)}
                    />
                  )
                })}
              </ol>
            </section>
          )}

          {fillers.length > 0 && (
            <section aria-labelledby="fillers-heading" className="mt-6">
              <h2 id="fillers-heading" className="mb-2 text-lg font-semibold">
                No-effort meals
              </h2>
              <ul className="space-y-2">
                {fillers.map(({ entry, entryIds }) => {
                  const key = `filler-${entry.id}`
                  const meals = entryIds.length * entry.meals_covered
                  return (
                    <MealRow
                      key={key}
                      planId={plan.id}
                      // Changes apply to one of the grouped meals at a time.
                      entryId={entryIds[entryIds.length - 1]}
                      recipeId={entry.id}
                      name={entry.name}
                      details={entryIds.length > 1 ? 'Changes apply to one of these at a time' : undefined}
                      aside={
                        <span className="rounded-full bg-success-soft px-3 py-1 text-sm font-semibold text-success ring-1 ring-success-line">
                          <span className="sr-only">{pluralize(meals, 'meal')}</span>
                          <span aria-hidden="true">× {meals}</span>
                        </span>
                      }
                      recipes={recipes}
                      maxSpoons={plan.max_spoons}
                      open={openRow === key}
                      onToggle={() => toggleRow(key)}
                    />
                  )
                })}
              </ul>
            </section>
          )}
        </>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={reshuffle} disabled={reshuffling} className={primaryButton}>
          {reshuffling ? 'Reshuffling…' : 'Reshuffle all'}
        </button>
        <button type="button" onClick={handleDelete} className={`${dangerButton} ml-auto`}>
          Delete plan
        </button>
      </div>
    </>
  )
}
