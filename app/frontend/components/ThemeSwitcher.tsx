import { useState } from 'react'

import { tabColors } from '@/components/ui'
import { getThemePreference, setThemePreference } from '@/lib/theme'
import type { ThemePreference } from '@/lib/theme'

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Auto' },
]

export default function ThemeSwitcher() {
  const [preference, setPreference] = useState(getThemePreference)

  function choose(value: ThemePreference) {
    setPreference(value)
    setThemePreference(value)
  }

  return (
    <div role="radiogroup" aria-label="Theme" className="inline-flex rounded-xl bg-surface p-1 ring-1 ring-line">
      {OPTIONS.map((option) => {
        const selected = preference === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            title={option.value === 'system' ? "Match your device's setting" : undefined}
            onClick={() => choose(option.value)}
            className={`min-h-9 rounded-lg px-3 text-sm font-medium transition ${tabColors(selected)}`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
