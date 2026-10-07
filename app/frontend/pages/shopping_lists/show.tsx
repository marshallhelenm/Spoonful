import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'

import { callout, card, checkbox, pageHeading, textLink } from '@/components/ui'
import { formatDate } from '@/lib/format'
import { withMember } from '@/lib/sets'
import type { ShoppingListItem, ShoppingListUse } from '@/types'

type Props = {
  meal_plan: { id: number; starts_on: string }
  items: ShoppingListItem[]
  recipes_without_ingredients: { id: number; name: string }[]
}

// "Garlic noodles: 6 cloves · Weeknight pasta ×2: 1 lb · Stir fry" (no amount listed for Stir fry)
function describeUses(uses: ShoppingListUse[]) {
  return uses
    .map((use) => {
      const recipe = use.times > 1 ? `${use.recipe_name} ×${use.times}` : use.recipe_name
      return use.amount ? `${recipe}: ${use.amount}` : recipe
    })
    .join(' · ')
}

export default function ShowShoppingList({ meal_plan: plan, items, recipes_without_ingredients: missing }: Props) {
  // Checkmarks change on screen immediately; the server catches up in the background.
  const [checked, setChecked] = useState(
    () => new Set(items.filter((item) => item.checked).map((item) => item.ingredient_id)),
  )

  function toggle(item: ShoppingListItem) {
    const nowChecked = !checked.has(item.ingredient_id)
    setChecked((current) => withMember(current, item.ingredient_id, nowChecked))
    router.patch(
      `/meal_plans/${plan.id}/shopping_list/items/${item.ingredient_id}`,
      { checked: nowChecked },
      // async: several quick taps don't cancel each other's requests.
      { async: true, preserveScroll: true, preserveState: true, only: ['items'] },
    )
  }

  // Items arrive sorted by name.
  const toBuy = items.filter((item) => !checked.has(item.ingredient_id))
  const inCart = items.filter((item) => checked.has(item.ingredient_id))

  const renderItem = (item: ShoppingListItem, done: boolean) => (
    <li key={item.ingredient_id}>
      <label className={`${card} flex cursor-pointer items-start gap-3 py-3`}>
        <input
          type="checkbox"
          checked={done}
          onChange={() => toggle(item)}
          className={`${checkbox} mt-1`}
        />
        <span className="min-w-0">
          <span className={`block font-semibold ${done ? 'text-subtle line-through' : ''}`}>{item.name}</span>
          <span className="block text-sm text-muted">{describeUses(item.uses)}</span>
        </span>
      </label>
    </li>
  )

  return (
    <>
      <Head title="Shopping list" />
      <h1 className={pageHeading}>Shopping list</h1>
      <p className="mt-1 text-sm text-muted">
        For the{' '}
        <Link href={`/meal_plans/${plan.id}`} className={textLink}>
          week of {formatDate(plan.starts_on)}
        </Link>
        {items.length > 0 && ` · ${inCart.length} of ${items.length} in your cart`}
      </p>

      {missing.length > 0 && (
        <div className={`${callout} mt-4 text-sm`}>
          <p className="font-semibold">Some recipes don't list ingredients yet:</p>
          <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            {missing.map((recipe) => (
              <li key={recipe.id}>
                <Link href={`/recipes/${recipe.id}/edit`} className={textLink}>
                  {recipe.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {items.length === 0 ? (
        <div className={`${card} mt-6 text-center text-muted`}>Nothing to buy for this plan.</div>
      ) : (
        <>
          <section aria-labelledby="to-buy-heading" className="mt-6">
            <h2 id="to-buy-heading" className="mb-2 text-lg font-semibold">
              To buy
            </h2>
            {toBuy.length === 0 ? (
              <p className="text-sm text-success">Got everything!</p>
            ) : (
              <ul className="space-y-2">{toBuy.map((item) => renderItem(item, false))}</ul>
            )}
          </section>

          {inCart.length > 0 && (
            <section aria-labelledby="in-cart-heading" className="mt-6">
              <h2 id="in-cart-heading" className="mb-2 text-lg font-semibold">
                In your cart
              </h2>
              <ul className="space-y-2">{inCart.map((item) => renderItem(item, true))}</ul>
            </section>
          )}
        </>
      )}
    </>
  )
}
