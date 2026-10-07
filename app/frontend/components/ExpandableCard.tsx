import { useState } from 'react'
import type { ReactNode } from 'react'

import { card, ghostButton } from '@/components/ui'

type Props = {
  title: ReactNode
  subtitle?: ReactNode
  // Shown just before the toggle button, e.g. a spoon rating.
  aside?: ReactNode
  // The toggle button's text while closed ("Edit", "Change"); it reads "Done" while open.
  toggleLabel: string
  panelId: string
  open: boolean
  onToggle: () => void
  // The panel's contents, shown while open.
  children: ReactNode
}

// A list item card with a title row and a button that opens a panel of
// actions below it. Render it inside a <ul> or <ol>.
export default function ExpandableCard({ title, subtitle, aside, toggleLabel, panelId, open, onToggle, children }: Props) {
  return (
    <li className={card}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{title}</p>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {aside}
          <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={panelId} className={ghostButton}>
            {open ? 'Done' : toggleLabel}
          </button>
        </div>
      </div>

      {open && (
        <div id={panelId} className="mt-3 space-y-4 border-t border-line pt-3">
          {children}
        </div>
      )}
    </li>
  )
}

// Which of several ExpandableCards is open: opening one closes the others.
export function useSingleOpen<Key>() {
  const [openKey, setOpenKey] = useState<Key | null>(null)
  return {
    isOpen: (key: Key) => openKey === key,
    toggle: (key: Key) => setOpenKey((current) => (current === key ? null : key)),
  }
}
