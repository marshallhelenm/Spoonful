// Shared Tailwind class strings so buttons and fields look the same everywhere.

const buttonBase =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ' +
  'transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

export const primaryButton = `${buttonBase} bg-accent text-on-accent hover:bg-accent-hover`
export const secondaryButton = `${buttonBase} bg-surface text-ink ring-1 ring-line-strong hover:bg-surface-hover`
export const dangerButton = `${buttonBase} bg-surface text-danger ring-1 ring-danger-line hover:bg-danger-soft`
// Text-only button, e.g. a row's "Change" / "Edit" toggle.
export const ghostButton = 'min-h-11 rounded-lg px-2 text-sm font-semibold text-accent-ink hover:bg-accent-soft'
// Compact buttons for inside a callout (an accent-soft box), e.g. "Did you mean …?".
export const calloutButton = 'min-h-9 rounded-lg bg-accent px-3 font-semibold text-on-accent hover:bg-accent-hover'
export const calloutQuietButton = 'min-h-9 rounded-lg px-3 font-semibold text-accent-ink hover:bg-surface'

export const textLink = 'font-semibold text-accent-ink underline'

// Colors for options where one is picked. Callers add their own shape and size.
// Choices (spoon picker, budget presets) fill in when selected...
export const choiceColors = (selected: boolean) =>
  selected ? 'bg-accent text-on-accent ring-accent' : 'bg-surface text-ink-soft ring-line-strong hover:bg-surface-hover'
// ...and tabs (main nav, theme switcher) get a soft tint.
export const tabColors = (selected: boolean) =>
  selected ? 'bg-accent-soft text-accent-ink' : 'text-muted hover:bg-surface-hover'

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
