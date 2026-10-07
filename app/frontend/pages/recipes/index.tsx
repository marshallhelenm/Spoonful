import { Head, Link } from '@inertiajs/react'

import Spoons from '@/components/Spoons'
import { card, pageHeading, primaryButton } from '@/components/ui'
import { formatDate, pluralize } from '@/lib/format'
import type { RecipeWithHistory } from '@/types'

export default function RecipesIndex({ recipes }: { recipes: RecipeWithHistory[] }) {
  return (
    <>
      <Head title="Recipes" />
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className={pageHeading}>Recipes</h1>
        <Link href="/recipes/new" className={primaryButton}>
          Add recipe
        </Link>
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
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <Link
                href={`/recipes/${recipe.id}/edit`}
                className={`${card} block h-full transition hover:ring-accent`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold">{recipe.name}</h2>
                  <Spoons count={recipe.spoons} />
                </div>
                <p className="mt-2 text-sm text-muted">
                  Makes {pluralize(recipe.meals_covered, 'meal')}
                  {' · '}
                  {recipe.last_made_on ? `Last planned ${formatDate(recipe.last_made_on)}` : 'Never planned'}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
