import { inputBase } from '@/components/ui'

type Props = {
  id: string
  value: number | ''
  onChange: (value: number | '') => void
  min?: number
  max?: number
  describedBy?: string
}

// A number field with big − / + buttons, easier to hit on a phone than tiny spinner arrows.
export default function NumberStepper({ id, value, onChange, min = 0, max, describedBy }: Props) {
  const clamp = (n: number) => Math.max(min, max === undefined ? n : Math.min(max, n))
  const current = value === '' ? min : value

  const stepButton =
    'flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface text-xl font-semibold text-ink-soft ' +
    'ring-1 ring-line-strong hover:bg-surface-hover disabled:opacity-40'

  return (
    <div className="mt-1 flex items-center gap-2">
      <button
        type="button"
        className={stepButton}
        aria-label="Decrease"
        disabled={current <= min}
        onClick={() => onChange(clamp(current - 1))}
      >
        −
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value === '' ? '' : clamp(Number(event.target.value)))}
        className={`${inputBase} w-20 text-center`}
      />
      <button
        type="button"
        className={stepButton}
        aria-label="Increase"
        disabled={max !== undefined && current >= max}
        onClick={() => onChange(clamp(current + 1))}
      >
        +
      </button>
    </div>
  )
}
