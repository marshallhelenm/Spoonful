// Shared Tailwind class strings so buttons and fields look the same everywhere.

const buttonBase =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ' +
  'transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

export const primaryButton = `${buttonBase} bg-accent text-on-accent hover:bg-accent-hover`
export const secondaryButton = `${buttonBase} bg-surface text-ink ring-1 ring-line-strong hover:bg-surface-hover`
export const dangerButton = `${buttonBase} bg-surface text-danger ring-1 ring-danger-line hover:bg-danger-soft`

export const pageHeading = 'font-display text-2xl font-normal leading-tight text-ink'

export const card = 'rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line'
// A highlighted notice box (its own class rather than card + overrides, which conflict).
export const callout = 'rounded-2xl bg-accent-soft p-4 text-ink ring-1 ring-accent-line'

export const label = 'block text-sm font-semibold text-ink'
export const inputBase =
  'rounded-xl border-line-strong bg-surface text-base text-ink shadow-sm focus:border-accent focus:ring-accent'
export const input = `mt-1 block w-full ${inputBase}`
export const checkbox =
  'mt-0.5 size-5 shrink-0 rounded border-line-strong bg-surface text-accent focus:ring-accent focus:ring-offset-surface'
