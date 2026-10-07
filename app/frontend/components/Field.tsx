import type { ReactNode } from 'react'

import FieldError, { errorMessage } from '@/components/FieldError'
import { label as labelClass } from '@/components/ui'

// What a field's control needs to hook up to its label, hint, and error.
export type FieldControl = {
  id: string
  describedBy: string | undefined
  invalid: true | undefined
}

type Props = {
  id: string
  label: ReactNode
  hint?: ReactNode
  error?: string | string[]
  // For controls that aren't one labelable element (e.g. a radiogroup that
  // names itself with aria-label), so the label is plain text.
  group?: boolean
  // Shown at the end of the label's line, e.g. a "Forgot it?" link.
  labelAside?: ReactNode
  className?: string
  children: (control: FieldControl) => ReactNode
}

// A form field: label, optional hint, the control, and its error, with the
// ids and aria-describedby wired up. Hint and error ids are `${id}-hint` and `${id}-error`.
export default function Field({ id, label, hint, error, group, labelAside, className, children }: Props) {
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const hasError = Boolean(errorMessage(error))
  const describedBy = [hint && hintId, hasError && errorId].filter(Boolean).join(' ') || undefined

  const labelElement = group ? (
    <span className={labelClass}>{label}</span>
  ) : (
    <label htmlFor={id} className={labelClass}>
      {label}
    </label>
  )

  return (
    <div className={className}>
      {labelAside ? (
        <div className="flex items-baseline justify-between">
          {labelElement}
          {labelAside}
        </div>
      ) : (
        labelElement
      )}
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {children({ id, describedBy, invalid: hasError || undefined })}
      <FieldError id={errorId} error={error} />
    </div>
  )
}
