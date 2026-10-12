import { Head, Link } from '@inertiajs/react'
import { useRef, useState } from 'react'

import { card, pageHeading, primaryButton, secondaryButton, textLink } from '@/components/ui'
import { formatDate } from '@/lib/format'

type Props = {
  meal_plan: { id: number; starts_on: string }
  markdown: string
}

// The shopping list as Markdown, to copy into another app or print.
export default function ShareShoppingList({ meal_plan: plan, markdown }: Props) {
  const textRef = useRef<HTMLPreElement>(null)
  const [copyStatus, setCopyStatus] = useState('')

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopyStatus('Copied!')
    } catch {
      // Clipboard access can be blocked; select the text so it can be copied by hand.
      const selection = window.getSelection()
      if (textRef.current && selection) selection.selectAllChildren(textRef.current)
      setCopyStatus("Couldn't copy automatically. The text is selected, so copy it from there.")
    }
  }

  return (
    <>
      <Head title="Share shopping list" />
      <div className="print:hidden">
        <h1 className={pageHeading}>Share shopping list</h1>
        <p className="mt-1 text-sm text-muted">
          For the{' '}
          <Link href={`/meal_plans/${plan.id}/shopping_list`} className={textLink}>
            week of {formatDate(plan.starts_on)}
          </Link>
          . Copy it into a notes or messaging app, or print it.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={copy} className={primaryButton}>
            Copy text
          </button>
          <button type="button" onClick={() => window.print()} className={secondaryButton}>
            Print
          </button>
          <p role="status" className="text-sm font-semibold text-success">
            {copyStatus}
          </p>
        </div>
      </div>

      <pre
        ref={textRef}
        className={`${card} mt-4 overflow-x-auto font-sans text-sm whitespace-pre-wrap print:mt-0 print:p-0 print:shadow-none print:ring-0`}
      >
        {markdown}
      </pre>
    </>
  )
}
