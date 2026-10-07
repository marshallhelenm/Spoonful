import { Link, router, usePage } from '@inertiajs/react'
import type { ReactNode } from 'react'

import ThemeSwitcher from '@/components/ThemeSwitcher'
import { callout, tabColors, textLink } from '@/components/ui'

const navItems = [
  { href: '/', label: 'Plan', matches: (url: string) => url === '/' || url === '/meal_plans/new' },
  {
    href: '/recipes',
    label: 'Recipes',
    matches: (url: string) => url.startsWith('/recipes') || url.startsWith('/ingredients'),
  },
  {
    href: '/meal_plans',
    label: 'History',
    matches: (url: string) => url.startsWith('/meal_plans') && url !== '/meal_plans/new',
  },
]

export default function Layout({ children }: { children: ReactNode }) {
  const { url, flash, props } = usePage()
  const user = props.current_user

  return (
    <div className="min-h-screen bg-page text-ink">
      <header className="border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link href="/" className="font-display text-xl font-normal text-accent-ink">
            <span aria-hidden="true" className="mr-1">🥄</span> Spoonful
          </Link>
          {user && (
            <nav aria-label="Main" className="flex gap-1">
              {navItems.map((item) => {
                const active = item.matches(url)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${tabColors(active)}`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 pb-10">
        {user?.demo && (
          <p className={`${callout} mb-4 text-sm`}>
            You're using the shared demo account, so other visitors can see your changes, and everything resets
            nightly.{' '}
            <button
              type="button"
              onClick={() => router.delete('/session', { onSuccess: () => router.visit('/sign_up') })}
              className={`${textLink} underline-offset-2`}
            >
              Sign up
            </button>{' '}
            to keep your own recipes.
          </p>
        )}
        {flash.notice && (
          <p role="status" className="mb-4 rounded-xl bg-success-soft px-4 py-3 text-sm text-success ring-1 ring-success-line">
            {flash.notice}
          </p>
        )}
        {flash.alert && (
          <p role="alert" className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger ring-1 ring-danger-line">
            {flash.alert}
          </p>
        )}
        {children}
      </main>

      <footer className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 pb-8 text-sm text-muted">
        {user ? (
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate">{user.email_address}</span>
            <button
              type="button"
              onClick={() => router.delete('/session')}
              className="min-h-9 shrink-0 rounded-lg px-2 font-semibold text-accent-ink hover:bg-accent-soft"
            >
              Sign out
            </button>
          </div>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3">
          <span aria-hidden="true">Theme</span>
          <ThemeSwitcher />
        </div>
      </footer>
    </div>
  )
}
