import type { ReactNode } from 'react'

// A 24×24 stroke icon (paths in the style of Lucide), drawn in the current text
// color so it follows whatever color its button or link has.
export default function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      {children}
    </svg>
  )
}
