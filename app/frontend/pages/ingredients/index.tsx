import { Head, Link, router, useForm } from '@inertiajs/react'
import { useState } from 'react'
import type { FormEvent } from 'react'

import ExpandableCard, { useSingleOpen } from '@/components/ExpandableCard'
import Field from '@/components/Field'
import {
  callout,
  calloutButton,
  calloutQuietButton,
  card,
  dangerButton,
  input,
  inputBase,
  label,
  pageHeading,
  primaryButton,
  secondaryButton,
  textLink,
} from '@/components/ui'
import { pluralize } from '@/lib/format'
import { findLikelyDuplicates, normalize } from '@/lib/ingredientMatch'

type IngredientWithRecipes = {
  id: number
  name: string
  recipes: { id: number; name: string }[]
}

const visitOptions = { preserveScroll: true }

function merge(from: IngredientWithRecipes, into: IngredientWithRecipes) {
  const message =
    from.recipes.length > 0
      ? `Merge “${from.name}” into “${into.name}”? ${pluralize(from.recipes.length, 'recipe')} will use “${into.name}” instead.`
      : `Merge “${from.name}” into “${into.name}”?`
  if (window.confirm(message)) {
    router.post(`/ingredients/${from.id}/merge`, { target_id: into.id }, visitOptions)
  }
}

function usageText(ingredient: IngredientWithRecipes) {
  return ingredient.recipes.length === 0 ? 'Unused' : `Used in ${pluralize(ingredient.recipes.length, 'recipe')}`
}

function IngredientRow({
  ingredient,
  others,
  open,
  onToggle,
}: {
  ingredient: IngredientWithRecipes
  others: IngredientWithRecipes[]
  open: boolean
  onToggle: () => void
}) {
  const panelId = `ingredient-${ingredient.id}`
  const rename = useForm({ name: ingredient.name })
  const [mergeTargetId, setMergeTargetId] = useState('')
  const unused = ingredient.recipes.length === 0

  function submitRename(event: FormEvent) {
    event.preventDefault()
    rename.transform((data) => ({ ingredient: data }))
    rename.patch(`/ingredients/${ingredient.id}`, { ...visitOptions, onSuccess: onToggle })
  }

  function submitMerge(event: FormEvent) {
    event.preventDefault()
    const target = others.find((other) => other.id === Number(mergeTargetId))
    if (target) merge(ingredient, target)
  }

  return (
    <ExpandableCard
      title={ingredient.name}
      subtitle={unused ? <span className="text-subtle">{usageText(ingredient)}</span> : usageText(ingredient)}
      toggleLabel="Edit"
      panelId={panelId}
      open={open}
      onToggle={onToggle}
    >
      {!unused && (
        <p className="text-sm text-muted">
          Used in:{' '}
          {ingredient.recipes.map((recipe, index) => (
            <span key={recipe.id}>
              {index > 0 && ', '}
              <Link href={`/recipes/${recipe.id}/edit`} className={textLink}>
                {recipe.name}
              </Link>
            </span>
          ))}
        </p>
      )}

      <form onSubmit={submitRename} noValidate>
        <Field id={`${panelId}-name`} label="Rename" error={rename.errors.name}>
          {({ id, describedBy, invalid }) => (
            <div className="mt-1 flex gap-2">
              <input
                id={id}
                type="text"
                value={rename.data.name}
                onChange={(event) => rename.setData('name', event.target.value)}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={`${inputBase} min-w-0 flex-1`}
              />
              <button type="submit" disabled={rename.processing} className={primaryButton}>
                Save
              </button>
            </div>
          )}
        </Field>
      </form>

      {others.length > 0 && (
        <form onSubmit={submitMerge}>
          <label htmlFor={`${panelId}-merge`} className={label}>
            Merge into
          </label>
          <p className="text-sm text-muted">For duplicates: recipes switch to the other ingredient and this one is removed.</p>
          <div className="mt-1 flex gap-2">
            <select
              id={`${panelId}-merge`}
              value={mergeTargetId}
              onChange={(event) => setMergeTargetId(event.target.value)}
              className={`${inputBase} min-w-0 flex-1`}
            >
              <option value="">Choose an ingredient…</option>
              {others.map((other) => (
                <option key={other.id} value={other.id}>
                  {other.name}
                </option>
              ))}
            </select>
            <button type="submit" disabled={!mergeTargetId} className={secondaryButton}>
              Merge
            </button>
          </div>
        </form>
      )}

      {unused && (
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Delete “${ingredient.name}”?`)) {
              router.delete(`/ingredients/${ingredient.id}`, visitOptions)
            }
          }}
          className={dangerButton}
        >
          Delete
        </button>
      )}
    </ExpandableCard>
  )
}

export default function IngredientsIndex({ ingredients }: { ingredients: IngredientWithRecipes[] }) {
  const rows = useSingleOpen<number>()
  const [filter, setFilter] = useState('')

  const byName = new Map(ingredients.map((ingredient) => [ingredient.name, ingredient]))
  // Suggest keeping whichever is used by more recipes (or the shorter name on a tie).
  const duplicates = findLikelyDuplicates(ingredients.map((ingredient) => ingredient.name)).map(([a, b]) => {
    const [first, second] = [byName.get(a)!, byName.get(b)!]
    const keepFirst =
      first.recipes.length !== second.recipes.length
        ? first.recipes.length > second.recipes.length
        : first.name.length <= second.name.length
    return keepFirst ? { keep: first, drop: second } : { keep: second, drop: first }
  })

  const query = normalize(filter)
  const shown = query ? ingredients.filter((ingredient) => normalize(ingredient.name).includes(query)) : ingredients

  return (
    <>
      <Head title="Ingredients" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className={pageHeading}>Ingredients</h1>
        <Link href="/recipes" className={`${textLink} text-sm`}>
          Back to recipes
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted">
        Every ingredient you've entered. Unused ones stay here so they're still suggested when you type.
      </p>

      {duplicates.length > 0 && (
        <section aria-labelledby="duplicates-heading" className={`${callout} mt-6`}>
          <h2 id="duplicates-heading" className="font-semibold">
            Possible duplicates
          </h2>
          <ul className="mt-2 space-y-3">
            {duplicates.map(({ keep, drop }) => (
              <li key={`${keep.id}-${drop.id}`} className="text-sm">
                <p>
                  <strong className="font-bold">{keep.name}</strong> ({usageText(keep).toLowerCase()}) and{' '}
                  <strong className="font-bold">{drop.name}</strong> ({usageText(drop).toLowerCase()})
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => merge(drop, keep)}
                    className={calloutButton}
                  >
                    Keep “{keep.name}”
                  </button>
                  <button
                    type="button"
                    onClick={() => merge(keep, drop)}
                    className={calloutQuietButton}
                  >
                    Keep “{drop.name}”
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {ingredients.length === 0 ? (
        <div className={`${card} mt-6 text-center text-muted`}>
          No ingredients yet. They're saved as you add them to recipes.
        </div>
      ) : (
        <>
          <div className="mt-6">
            <label htmlFor="ingredient-filter" className="sr-only">
              Filter ingredients
            </label>
            <input
              id="ingredient-filter"
              type="search"
              placeholder={`Filter ${pluralize(ingredients.length, 'ingredient')}`}
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className={input}
            />
          </div>
          {shown.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No ingredients match “{filter}”.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {shown.map((ingredient) => (
                <IngredientRow
                  key={ingredient.id}
                  ingredient={ingredient}
                  others={ingredients.filter((other) => other.id !== ingredient.id)}
                  open={rows.isOpen(ingredient.id)}
                  onToggle={() => rows.toggle(ingredient.id)}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </>
  )
}
