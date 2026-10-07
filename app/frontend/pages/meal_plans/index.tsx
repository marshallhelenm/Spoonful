import { Head, Link } from '@inertiajs/react'

import { card, primaryButton } from '@/components/ui'
import { formatDate, pluralize } from '@/lib/format'
import type { MealPlanSummary } from '@/types'

export default function MealPlansIndex({ meal_plans: plans }: { meal_plans: MealPlanSummary[] }) {
  return (
    <>
      <Head title="History" />
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Past plans</h1>
        <Link href="/" className={primaryButton}>
          New plan
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className={`${card} text-center text-muted`}>No meal plans yet.</div>
      ) : (
        <ul className="space-y-2">
          {plans.map((plan) => (
            <li key={plan.id}>
              <Link
                href={`/meal_plans/${plan.id}`}
                className={`${card} flex items-center justify-between gap-3 transition hover:ring-accent`}
              >
                <span className="font-semibold">Week of {formatDate(plan.starts_on)}</span>
                <span className="text-right text-sm text-muted">
                  {plan.total_spoons} / {plan.spoon_budget} spoons
                  <br />
                  {pluralize(plan.meals_planned, 'meal')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
