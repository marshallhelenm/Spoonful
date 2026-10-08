import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getThemePreference, setThemePreference } from './theme'

// Minimal stand-ins for the browser pieces theme.ts touches (no DOM in these tests).
function fakeStorage() {
  const items = new Map<string, string>()
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    removeItem: (key: string) => void items.delete(key),
  }
}

let root: { dataset: Record<string, string> }
let metas: { media: string; content: string }[]

beforeEach(() => {
  root = { dataset: {} }
  metas = [
    { media: '(prefers-color-scheme: light)', content: '' },
    { media: '(prefers-color-scheme: dark)', content: '' },
  ]
  vi.stubGlobal('localStorage', fakeStorage())
  vi.stubGlobal('document', { documentElement: root, querySelectorAll: () => metas })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('theme preference', () => {
  it('defaults to following the device', () => {
    expect(getThemePreference()).toBe('system')
  })

  it('saves a forced theme and applies it to the page and browser bar', () => {
    setThemePreference('dark')

    expect(getThemePreference()).toBe('dark')
    expect(root.dataset.theme).toBe('dark')
    expect(metas.map((meta) => meta.content)).toEqual(['#2e2414', '#2e2414'])
  })

  it('going back to Auto clears the saved choice and restores per-scheme bar colors', () => {
    setThemePreference('light')
    setThemePreference('system')

    expect(getThemePreference()).toBe('system')
    expect(root.dataset.theme).toBeUndefined()
    expect(metas.map((meta) => meta.content)).toEqual(['#fffbea', '#2e2414'])
  })

  it('ignores a saved value it does not recognize', () => {
    localStorage.setItem('spoonful-theme', 'sepia')
    expect(getThemePreference()).toBe('system')
  })

  it('still applies the theme when storage is unavailable', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    })

    expect(getThemePreference()).toBe('system')
    setThemePreference('dark')
    expect(root.dataset.theme).toBe('dark')
  })
})
