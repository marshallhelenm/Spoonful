import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { formatDate, pluralize } from './format'

const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }

describe('formatDate', () => {
  // A timezone behind UTC, where parsing "YYYY-MM-DD" as UTC lands on the day before.
  beforeAll(() => {
    vi.stubEnv('TZ', 'America/Los_Angeles')
  })
  afterAll(() => {
    vi.unstubAllEnvs()
  })

  it('keeps the calendar date in timezones behind UTC', () => {
    // The trap formatDate avoids: new Date("2026-10-05") is midnight UTC, still Oct 4 here.
    expect(new Date('2026-10-05').getDate()).toBe(4)

    expect(formatDate('2026-10-05')).toBe(new Date(2026, 9, 5).toLocaleDateString(undefined, dateOptions))
  })
})

describe('pluralize', () => {
  it('uses the singular only for exactly one', () => {
    expect(pluralize(1, 'meal')).toBe('1 meal')
    expect(pluralize(0, 'meal')).toBe('0 meals')
    expect(pluralize(2, 'meal')).toBe('2 meals')
  })

  it('takes an irregular plural', () => {
    expect(pluralize(3, 'leaf', 'leaves')).toBe('3 leaves')
  })
})
