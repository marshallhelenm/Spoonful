// Shared Tailwind class strings so buttons and fields look the same everywhere.

const buttonBase =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ' +
  'transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

export const primaryButton = `${buttonBase} bg-amber-700 text-white hover:bg-amber-800`
export const secondaryButton = `${buttonBase} bg-white text-stone-800 ring-1 ring-stone-300 hover:bg-stone-100`
export const dangerButton = `${buttonBase} bg-white text-red-700 ring-1 ring-red-200 hover:bg-red-50`

export const card = 'rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200'

export const label = 'block text-sm font-semibold text-stone-800'
export const inputBase =
  'rounded-xl border-stone-300 text-base shadow-sm focus:border-amber-600 focus:ring-amber-600'
export const input = `mt-1 block w-full ${inputBase}`
export const checkbox = 'mt-0.5 size-5 shrink-0 rounded border-stone-300 text-amber-700 focus:ring-amber-600'
