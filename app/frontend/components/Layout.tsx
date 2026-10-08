import { Link, router, usePage } from '@inertiajs/react'
import type { ReactNode } from 'react'

import ThemeSwitcher from '@/components/ThemeSwitcher'
import UserMenu from '@/components/UserMenu'
import { callout, tabColors, textLink } from '@/components/ui'
import spoonImage from '@/images/spoon.webp'

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
    <div className="flex min-h-dvh flex-col bg-page text-ink">
      <header className="relative z-10 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-normal text-accent-ink">
            <img src={spoonImage} alt="" width={105} height={96} className="h-8 w-auto" />
            Spoonful
          </Link>
          {user && (
            // Phones: logo and account menu on the top row, nav below.
            // Wider: one row, with nav and account menu on the right.
            <>
              <nav aria-label="Main" className="order-last flex w-full justify-end gap-1 sm:order-none sm:ml-auto sm:w-auto">
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
              <div className="ml-auto sm:ml-0">
                <UserMenu email={user.email_address} />
              </div>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-10">
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

      <footer className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-end gap-3 px-4 pb-2 text-sm text-muted">
        <div className="flex items-center gap-3">
          <span aria-hidden="true">Theme</span>
          <ThemeSwitcher />
        </div>
        <p className="w-full text-xs text-subtle">
          Spoon image by{' '}
          <a href="https://www.magnific.com/free-psd/single-wooden-spoon-cooking-serving_425416032.htm" className="underline">
            muhammad.abdullah on Magnific
          </a>
        </p>
      </footer>
    </div>
  )
}
