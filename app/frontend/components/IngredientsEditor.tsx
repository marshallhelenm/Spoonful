import { useEffect, useRef, useState } from 'react'

import IngredientNameInput from '@/components/IngredientNameInput'
import { inputBase, secondaryButton } from '@/components/ui'
import { findNearMatch } from '@/lib/ingredientMatch'

export type IngredientRow = {
  // Client-only id so React can track rows as they're added and removed.
  id: string
  name: string
  amount: string
}

let nextRowId = 0
export function newIngredientRow(name = '', amount = ''): IngredientRow {
  nextRowId += 1
  return { id: `ingredient-${nextRowId}`, name, amount }
}

type Props = {
  rows: IngredientRow[]
  onChange: (rows: IngredientRow[]) => void
  savedNames: string[]
}

// Editable list of ingredient lines (name + optional amount), with
// suggestions from saved ingredients and a "did you mean" check for near-duplicates.
export default function IngredientsEditor({ rows, onChange, savedNames }: Props) {
  // Rows whose name has been finished (field left) and so can be checked for near-duplicates.
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  // Rows where the user chose to keep their spelling despite a near-match.
  const [keptIds, setKeptIds] = useState<Set<string>>(new Set())
  const nameInputs = useRef(new Map<string, HTMLInputElement>())
  const amountInputs = useRef(new Map<string, HTMLInputElement>())
  const [focusRowId, setFocusRowId] = useState<string | null>(null)

  useEffect(() => {
    if (focusRowId) {
      nameInputs.current.get(focusRowId)?.focus()
      setFocusRowId(null)
    }
  }, [focusRowId])

  const update = (id: string, changes: Partial<IngredientRow>) =>
    onChange(rows.map((row) => (row.id === id ? { ...row, ...changes } : row)))

  const withId = (set: Set<string>, id: string, present: boolean) => {
    const next = new Set(set)
    if (present) next.add(id)
    else next.delete(id)
    return next
  }

  function changeName(id: string, name: string) {
    update(id, { name })
    setCheckedIds((set) => withId(set, id, false))
    setKeptIds((set) => withId(set, id, false))
  }

  function addRow() {
    const row = newIngredientRow()
    onChange([...rows, row])
    setFocusRowId(row.id)
  }

  function removeRow(id: string) {
    onChange(rows.filter((row) => row.id !== id))
  }

  return (
    <div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">No ingredients yet.</p>
      ) : (
        <ol className="space-y-3">
          {rows.map((row, index) => {
            const number = index + 1
            const nearMatch =
              checkedIds.has(row.id) && !keptIds.has(row.id) ? findNearMatch(row.name, savedNames) : null

            return (
              <li key={row.id}>
                <div className="flex items-center gap-2">
                  <IngredientNameInput
                    ref={(element) => {
                      if (element) nameInputs.current.set(row.id, element)
                      else nameInputs.current.delete(row.id)
                    }}
                    label={`Ingredient ${number}`}
                    value={row.name}
                    savedNames={savedNames}
                    onChange={(name) => changeName(row.id, name)}
                    onBlur={() => setCheckedIds((set) => withId(set, row.id, true))}
                    onEnter={() => amountInputs.current.get(row.id)?.focus()}
                  />
                  <input
                    ref={(element) => {
                      if (element) amountInputs.current.set(row.id, element)
                      else amountInputs.current.delete(row.id)
                    }}
                    type="text"
                    aria-label={`Amount for ingredient ${number}`}
                    placeholder="Amount"
                    autoComplete="off"
                    value={row.amount}
                    onChange={(event) => update(row.id, { amount: event.target.value })}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        addRow()
                      }
                    }}
                    className={`${inputBase} w-24 shrink-0 sm:w-32`}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    aria-label={`Remove ingredient ${number}${row.name ? ` (${row.name})` : ''}`}
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl text-xl text-subtle hover:bg-surface-hover hover:text-danger"
                  >
                    ×
                  </button>
                </div>

                <div aria-live="polite">
                  {nearMatch && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-accent-soft px-3 py-2 text-sm text-ink ring-1 ring-accent-line">
                      <span>
                        Did you mean <strong className="font-bold">{nearMatch}</strong>?
                      </span>
                      <span className="ml-auto flex gap-2">
                        <button
                          type="button"
                          onClick={() => update(row.id, { name: nearMatch })}
                          className="min-h-9 rounded-lg bg-accent px-3 font-semibold text-on-accent hover:bg-accent-hover"
                        >
                          Use {nearMatch}
                        </button>
                        <button
                          type="button"
                          onClick={() => setKeptIds((set) => withId(set, row.id, true))}
                          className="min-h-9 rounded-lg px-3 font-semibold text-accent-ink hover:bg-surface"
                        >
                          Keep “{row.name.trim()}”
                        </button>
                      </span>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}

      <button type="button" onClick={addRow} className={`${secondaryButton} mt-3`}>
        + Add ingredient
      </button>
    </div>
  )
}
