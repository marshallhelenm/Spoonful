import { Link, router, usePage } from '@inertiajs/react'
import { useEffect, useRef, useState } from 'react'

import Icon from '@/components/Icon'
import { tabColors } from '@/components/ui'

const menuItem =
  'flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-semibold text-ink hover:bg-surface-hover'

// The person icon in the header. Opens a small panel with the signed-in email,
// a link to account settings, and sign out. Closes on an outside click or tap,
// on Escape, when focus moves elsewhere, and on navigation.
export default function UserMenu({ email }: { email: string }) {
  const { url } = usePage()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setOpen(false), [url])

  useEffect(() => {
    if (!open) return

    const isOutside = (target: EventTarget | null) =>
      !(target instanceof Node && containerRef.current?.contains(target))

    function onPointerDown(event: PointerEvent) {
      if (isOutside(event.target)) setOpen(false)
    }
    // Tabbing past the last item, or anywhere else, closes the panel. (Not
    // onBlur: Safari doesn't focus clicked links, so the panel would close
    // before the click lands.)
    function onFocusIn(event: FocusEvent) {
      if (isOutside(event.target)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        aria-controls="user-menu"
        aria-label="Account"
        title="Account"
        className={`inline-flex size-10 items-center justify-center rounded-full ${tabColors(open || url === '/account')}`}
      >
        <Icon>
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </Icon>
      </button>

      {open && (
        <div
          id="user-menu"
          className="absolute right-0 top-full z-20 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl bg-surface p-2 shadow-lg ring-1 ring-line"
        >
          <p className="px-3 pt-1 pb-2 text-sm">
            <span className="block text-muted">Signed in as</span>
            <span className="block font-semibold break-all text-ink">{email}</span>
          </p>
          <div className="border-t border-line pt-2">
            <Link href="/account" aria-current={url === '/account' ? 'page' : undefined} className={menuItem}>
              Account settings
            </Link>
            <button type="button" onClick={() => router.delete('/session')} className={menuItem}>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
