const OPTIONS = [0, 1, 2, 3, 4, 5]

type Props = {
  label?: string
  value: number | null
  onChange: (value: number) => void
  describedBy?: string
  invalid?: boolean
}

// Pick a 0–5 spoon rating with large tap targets.
export default function SpoonPicker({ label = 'Spoons', value, onChange, describedBy, invalid }: Props) {
  return (
    <div role="radiogroup" aria-label={label} aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      className="mt-1 grid grid-cols-6 gap-2">
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
                ? 'bg-accent text-on-accent ring-accent'
                : 'bg-surface text-ink-soft ring-line-strong hover:bg-surface-hover'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
