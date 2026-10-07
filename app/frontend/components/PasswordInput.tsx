import { useState } from 'react'

import { inputBase } from '@/components/ui'

type Props = {
  id: string
  value: string
  onChange: (value: string) => void
  autoComplete: 'current-password' | 'new-password'
  describedBy?: string
  invalid?: boolean
}

// Password field with a Show/Hide button instead of a "confirm password" field.
export default function PasswordInput({ id, value, onChange, autoComplete, describedBy, invalid }: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="mt-1 flex gap-2">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className={`${inputBase} block min-w-0 flex-1`}
      />
      <button
        type="button"
        onClick={() => setVisible((shown) => !shown)}
        aria-controls={id}
        aria-pressed={visible}
        className="min-h-11 shrink-0 rounded-xl px-3 text-sm font-semibold text-accent-ink ring-1 ring-line-strong hover:bg-surface-hover"
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}
