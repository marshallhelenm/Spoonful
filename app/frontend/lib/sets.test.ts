import { describe, expect, it } from 'vitest'

import { withMember } from './sets'

describe('withMember', () => {
  it('adds or removes a value without changing the original set', () => {
    const original = new Set([1, 2])

    expect([...withMember(original, 3, true)]).toEqual([1, 2, 3])
    expect([...withMember(original, 1, false)]).toEqual([2])
    expect([...original]).toEqual([1, 2])
  })
})
