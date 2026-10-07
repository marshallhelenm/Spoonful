import { Link, usePage } from '@inertiajs/react'
import type { ReactNode } from 'react'

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
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link href="/" className="text-lg font-bold tracking-tight text-amber-800">
            <span aria-hidden="true">🥄</span> Spoonful
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
                    active ? 'bg-amber-100 text-amber-900' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 pb-16">
        {flash.notice && (
          <p role="status" className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ring-1 ring-emerald-200">
            {flash.notice}
          </p>
        )}
        {flash.alert && (
          <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-900 ring-1 ring-red-200">
            {flash.alert}
          </p>
        )}
        {children}
      </main>
    </div>
  )
}
