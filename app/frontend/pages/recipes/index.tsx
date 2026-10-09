import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'

import Spoons from '@/components/Spoons'
import { card, checkbox, pageHeading, primaryButton, secondaryButton } from '@/components/ui'
import { formatDate, pluralize } from '@/lib/format'
import { withMember } from '@/lib/sets'
import type { RecipeWithHistory } from '@/types'

export default function RecipesIndex({ recipes }: { recipes: RecipeWithHistory[] }) {
  // Toggles change on screen immediately; the server catches up in the background.
  const [included, setIncluded] = useState(
    () => new Set(recipes.filter((recipe) => recipe.include_in_plans).map((recipe) => recipe.id)),
  )

  function toggle(recipe: RecipeWithHistory) {
    const nowIncluded = !included.has(recipe.id)
    setIncluded((current) => withMember(current, recipe.id, nowIncluded))
    router.patch(
      `/recipes/${recipe.id}/plan_inclusion`,
      { included: nowIncluded },
      // async: several quick taps don't cancel each other's requests.
      { async: true, preserveScroll: true, preserveState: true, only: ['recipes'] },
    )
  }

  return (
    <>
      <Head title="Recipes" />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className={pageHeading}>Recipes</h1>
        <div className="flex gap-2">
          <Link href="/ingredients" className={secondaryButton}>
            Ingredients
          </Link>
          <Link href="/recipes/new" className={primaryButton}>
            Add recipe
          </Link>
        </div>
      </div>

      {recipes.length === 0 ? (
        <div className={`${card} text-center text-muted`}>
          <p className="font-semibold text-ink">No recipes yet.</p>
          <p className="mt-1 text-sm">
            Add the meals you make, plus a few 0-spoon options like takeout or leftovers.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {recipes.map((recipe) => {
            const isIncluded = included.has(recipe.id)
            return (
              // The name's link stretches over the whole card; the checkbox sits above it.
              <li
                key={recipe.id}
                className={`${card} relative flex h-full flex-col transition hover:ring-accent has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-accent`}
              >
                <div className={`flex-1 ${isIncluded ? '' : 'opacity-60'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold">
                      <Link
                        href={`/recipes/${recipe.id}/edit`}
                        className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none"
                      >
                        {recipe.name}
                      </Link>
                    </h2>
                    <Spoons count={recipe.spoons} />
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    Makes {pluralize(recipe.meals_covered, 'meal')}
                    {recipe.ingredient_count > 0 && ` · ${pluralize(recipe.ingredient_count, 'ingredient')}`}
                    {' · '}
                    {recipe.last_made_on ? `Last planned ${formatDate(recipe.last_made_on)}` : 'Never planned'}
                  </p>
                </div>
                <label className="relative z-10 mt-3 flex w-fit cursor-pointer items-start gap-2 text-sm font-semibold text-ink-soft">
                  <input
                    type="checkbox"
                    checked={isIncluded}
                    onChange={() => toggle(recipe)}
                    className={checkbox}
                  />
                  <span>
                    <span className="sr-only">{recipe.name}: </span>Include in meal plans
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
