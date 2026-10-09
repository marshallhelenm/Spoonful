import { useEffect, useRef, useState } from 'react'

import IngredientNameInput from '@/components/IngredientNameInput'
import { calloutButton, calloutQuietButton, inputBase, secondaryButton } from '@/components/ui'
import { findNearMatch } from '@/lib/ingredientMatch'
import { withMember } from '@/lib/sets'

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
  // Screen-reader announcement after a row moves.
  const [moveAnnouncement, setMoveAnnouncement] = useState('')

  useEffect(() => {
    if (focusRowId) {
      nameInputs.current.get(focusRowId)?.focus()
      setFocusRowId(null)
    }
  }, [focusRowId])

  const update = (id: string, changes: Partial<IngredientRow>) =>
    onChange(rows.map((row) => (row.id === id ? { ...row, ...changes } : row)))

  function changeName(id: string, name: string) {
    update(id, { name })
    setCheckedIds((set) => withMember(set, id, false))
    setKeptIds((set) => withMember(set, id, false))
  }

  function addRow() {
    const row = newIngredientRow()
    onChange([...rows, row])
    setFocusRowId(row.id)
  }

  function removeRow(id: string) {
    onChange(rows.filter((row) => row.id !== id))
  }

  function moveRow(id: string, offset: -1 | 1) {
    const from = rows.findIndex((row) => row.id === id)
    const to = from + offset
    if (from < 0 || to < 0 || to >= rows.length) return

    const reordered = [...rows]
    const [row] = reordered.splice(from, 1)
    reordered.splice(to, 0, row)
    onChange(reordered)
    setMoveAnnouncement(`${row.name.trim() || 'Ingredient'} moved to position ${to + 1} of ${rows.length}`)
  }

  const moveButton =
    'flex h-6 w-8 items-center justify-center rounded-md text-xs text-subtle hover:bg-surface-hover hover:text-ink ' +
    'aria-disabled:cursor-default aria-disabled:opacity-30 aria-disabled:hover:bg-transparent'

  return (
    <div>
      <p className="sr-only" aria-live="polite">
        {moveAnnouncement}
      </p>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">No ingredients yet.</p>
      ) : (
        <ol className="space-y-3">
          {rows.map((row, index) => {
            const number = index + 1
            const nearMatch =
              checkedIds.has(row.id) && !keptIds.has(row.id) ? findNearMatch(row.name, savedNames) : null
            const description = `ingredient ${number}${row.name ? ` (${row.name})` : ''}`
            const isFirst = index === 0
            const isLast = index === rows.length - 1

            return (
              <li key={row.id}>
                {/* On phones the focused field widens: the amount grows while it's being typed in and
                    shrinks while the name is. The name field (flex-1) takes whatever is left. */}
                <div className="group/row flex items-center gap-2">
                  {/* aria-disabled instead of disabled, so keyboard focus stays put when a row reaches the end */}
                  <div className="flex shrink-0 flex-col">
                    <button
                      type="button"
                      aria-label={`Move ${description} up`}
                      aria-disabled={isFirst}
                      onClick={() => !isFirst && moveRow(row.id, -1)}
                      className={moveButton}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${description} down`}
                      aria-disabled={isLast}
                      onClick={() => !isLast && moveRow(row.id, 1)}
                      className={moveButton}
                    >
                      ▼
                    </button>
                  </div>
                  <IngredientNameInput
                    ref={(element) => {
                      if (element) nameInputs.current.set(row.id, element)
                      else nameInputs.current.delete(row.id)
                    }}
                    label={`Ingredient ${number}`}
                    value={row.name}
                    savedNames={savedNames}
                    onChange={(name) => changeName(row.id, name)}
                    onBlur={() => setCheckedIds((set) => withMember(set, row.id, true))}
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
                    className={`${inputBase} w-24 shrink-0 transition-[width] motion-reduce:transition-none max-sm:focus:w-36 max-sm:group-has-[[data-ingredient-name]:focus]/row:w-16 sm:w-32`}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    aria-label={`Remove ${description}`}
                    className="flex h-11 w-9 shrink-0 items-center justify-center rounded-xl text-xl text-subtle hover:bg-surface-hover hover:text-danger"
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
                          className={calloutButton}
                        >
                          Use {nearMatch}
                        </button>
                        <button
                          type="button"
                          onClick={() => setKeptIds((set) => withMember(set, row.id, true))}
                          className={calloutQuietButton}
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
