import { Link, usePage } from '@inertiajs/react'
import type { ReactNode } from 'react'

import ThemeSwitcher from '@/components/ThemeSwitcher'

const navItems = [
  { href: '/', label: 'Plan', matches: (url: string) => url === '/' || url === '/meal_plans/new' },
  { href: '/recipes', label: 'Recipes', matches: (url: string) => url.startsWith('/recipes') },
  {
    href: '/meal_plans',
    label: 'History',
    matches: (url: string) => url.startsWith('/meal_plans') && url !== '/meal_plans/new',
  },
]

export default function Layout({ children }: { children: ReactNode }) {
  const { url, flash } = usePage()

  return (
    <div className="min-h-screen bg-page text-ink">
      <header className="border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link href="/" className="text-lg font-bold tracking-tight text-accent-ink">
            <span aria-hidden="true" className="mr-1">🥄</span> Spoonful
          </Link>
          <nav aria-label="Main" className="flex gap-1">
            {navItems.map((item) => {
              const active = item.matches(url)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    active ? 'bg-accent-soft text-accent-ink' : 'text-muted hover:bg-surface-hover'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 pb-10">
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

      <footer className="mx-auto flex max-w-3xl items-center justify-end gap-3 px-4 pb-8 text-sm text-muted">
        <span aria-hidden="true">Theme</span>
        <ThemeSwitcher />
      </footer>
    </div>
  )
}
