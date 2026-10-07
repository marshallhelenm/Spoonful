const OPTIONS = [0, 1, 2, 3, 4, 5]

type Props = {
  value: number | null
  onChange: (value: number) => void
  describedBy?: string
}

// Pick a 0–5 spoon rating with large tap targets.
export default function SpoonPicker({ value, onChange, describedBy }: Props) {
  return (
    <div role="radiogroup" aria-label="Spoons" aria-describedby={describedBy} className="mt-1 grid grid-cols-6 gap-2">
      {OPTIONS.map((option) => {
        const selected = value === option
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option)}
            className={`min-h-11 rounded-xl text-base font-semibold ring-1 transition ${
              selected
                ? 'bg-amber-700 text-white ring-amber-700'
                : 'bg-white text-stone-700 ring-stone-300 hover:bg-stone-100'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
