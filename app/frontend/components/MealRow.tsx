import { router } from '@inertiajs/react'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { card, dangerButton, ghostButton, inputBase, secondaryButton } from '@/components/ui'
import { pluralize } from '@/lib/format'
import type { RecipeOption } from '@/types'

type Props = {
  planId: number
  // The plan entry that the actions change (for a grouped row, one of its entries).
  entryId: number
  recipeId: number
  name: string
  details?: string
  aside: ReactNode
  recipes: RecipeOption[]
  maxSpoons: number | null
  open: boolean
  onToggle: () => void
}

function spoonGroupLabel(spoons: number) {
  return spoons === 0 ? 'No effort' : pluralize(spoons, 'spoon')
}

// One meal in a plan, with a "Change" panel to shuffle, replace, or remove it.
export default function MealRow({
  planId,
  entryId,
  recipeId,
  name,
  details,
  aside,
  recipes,
  maxSpoons,
  open,
  onToggle,
}: Props) {
  const [busy, setBusy] = useState(false)
  const entryPath = `/meal_plans/${planId}/entries/${entryId}`
  const panelId = `meal-actions-${entryId}`
  const visitOptions = {
    preserveScroll: true,
    onStart: () => setBusy(true),
    onFinish: () => setBusy(false),
  }

  const spoonLevels = [...new Set(recipes.map((recipe) => recipe.spoons))]

  return (
    <li className={card}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{name}</p>
          {details && <p className="text-sm text-muted">{details}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {aside}
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={panelId}
            className={ghostButton}
          >
            {open ? 'Done' : 'Change'}
          </button>
        </div>
      </div>

      {open && (
        <div id={panelId} className="mt-3 space-y-3 border-t border-line pt-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => router.post(`${entryPath}/shuffle`, {}, visitOptions)}
              className={secondaryButton}
            >
              <span aria-hidden="true">🎲</span> Random
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => router.delete(entryPath, visitOptions)}
              className={dangerButton}
            >
              Remove
            </button>
          </div>
          <div>
            <label htmlFor={`replace-${entryId}`} className="text-sm font-semibold text-ink">
              Replace with
            </label>
            <select
              id={`replace-${entryId}`}
              value=""
              disabled={busy}
              onChange={(event) =>
                router.patch(entryPath, { meal_plan_entry: { recipe_id: Number(event.target.value) } }, visitOptions)
              }
              className={`${inputBase} mt-1 block w-full`}
            >
              <option value="" disabled>
                Choose a recipe…
              </option>
              {spoonLevels.map((spoons) => (
                <optgroup key={spoons} label={spoonGroupLabel(spoons)}>
                  {recipes
                    .filter((recipe) => recipe.spoons === spoons && recipe.id !== recipeId)
                    .map((recipe) => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.name}
                        {maxSpoons !== null && recipe.spoons > maxSpoons ? ' (over your limit)' : ''}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      )}
    </li>
  )
}
