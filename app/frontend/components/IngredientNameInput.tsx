import { forwardRef, useId, useState } from 'react'
import type { KeyboardEvent } from 'react'

import { inputBase } from '@/components/ui'
import { normalize, suggestIngredients } from '@/lib/ingredientMatch'

type Props = {
  value: string
  onChange: (value: string) => void
  savedNames: string[]
  label: string
  onBlur?: () => void
  // Enter with no suggestion highlighted (e.g. to move on to the amount field).
  onEnter?: () => void
}

// A text input that suggests saved ingredient names as you type
// (the ARIA "combobox with listbox popup" pattern).
const IngredientNameInput = forwardRef<HTMLInputElement, Props>(function IngredientNameInput(
  { value, onChange, savedNames, label, onBlur, onEnter },
  ref,
) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  // Don't suggest the exact thing already typed.
  const suggestions = suggestIngredients(value, savedNames).filter((name) => normalize(name) !== normalize(value))
  const showList = open && suggestions.length > 0

  function choose(name: string) {
    onChange(name)
    setOpen(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' && suggestions.length > 0) {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((index) => (index + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp' && showList) {
      event.preventDefault()
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1))
    } else if (event.key === 'Enter') {
      event.preventDefault() // never submit the whole recipe form from here
      if (showList && activeIndex >= 0) choose(suggestions[activeIndex])
      else onEnter?.()
    } else if (event.key === 'Escape' && showList) {
      event.preventDefault()
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div className="relative min-w-0 flex-1">
      <input
        ref={ref}
        type="text"
        role="combobox"
        // Lets IngredientsEditor narrow the amount field while this one has focus.
        data-ingredient-name
        aria-label={label}
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        autoComplete="off"
        placeholder="Ingredient"
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
          setOpen(true)
          setActiveIndex(-1)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setOpen(false)
          setActiveIndex(-1)
          onBlur?.()
        }}
        onKeyDown={handleKeyDown}
        className={`${inputBase} block w-full`}
      />
      <ul
        id={listId}
        role="listbox"
        aria-label={`Suggestions for ${label}`}
        hidden={!showList}
        className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl bg-surface py-1 shadow-lg ring-1 ring-line"
      >
        {suggestions.map((name, index) => (
          <li
            key={name}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={index === activeIndex}
            // mousedown (not click) so the input doesn't blur and close the list first
            onMouseDown={(event) => {
              event.preventDefault()
              choose(name)
            }}
            className={`cursor-pointer px-3 py-2.5 text-base ${
              index === activeIndex ? 'bg-accent-soft text-accent-ink' : 'hover:bg-surface-hover'
            }`}
          >
            {name}
          </li>
        ))}
      </ul>
    </div>
  )
})

export default IngredientNameInput
