import { Head } from '@inertiajs/react'
import type { ReactNode } from 'react'

import { card, pageHeading } from '@/components/ui'

// Narrow centered card used by the sign-in, sign-up, and password pages.
export default function AuthCard({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-sm">
      <Head title={title} />
      <h1 className={pageHeading}>{title}</h1>
      {intro && <p className="mt-1 text-sm text-muted">{intro}</p>}
      <div className={`${card} mt-6`}>{children}</div>
    </div>
  )
}
