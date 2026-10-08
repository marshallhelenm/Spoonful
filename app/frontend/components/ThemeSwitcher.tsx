import { useState } from 'react'
import type { ReactNode } from 'react'

import Icon from '@/components/Icon'
import { tabColors } from '@/components/ui'
import { getThemePreference, setThemePreference } from '@/lib/theme'
import type { ThemePreference } from '@/lib/theme'

const SunIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </Icon>
)

const MoonIcon = () => (
  <Icon>
    <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
  </Icon>
)

// Half light, half dark: follows the device's setting.
const AutoIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
  </Icon>
)

// `label` is the accessible name (and tooltip) when an option shows an icon instead of text.
const OPTIONS: { value: ThemePreference; label: string; icon?: ReactNode; title?: string }[] = [
  { value: 'light', label: 'Light', icon: <SunIcon /> },
  { value: 'dark', label: 'Dark', icon: <MoonIcon /> },
  { value: 'system', label: 'Auto', icon: <AutoIcon />, title: "Auto: match your device's setting" },
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
            aria-label={option.icon ? option.label : undefined}
            title={option.title ?? (option.icon ? option.label : undefined)}
            onClick={() => choose(option.value)}
            className={`inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition ${tabColors(selected)}`}
          >
            {option.icon ?? option.label}
          </button>
        )
      })}
    </div>
  )
}
