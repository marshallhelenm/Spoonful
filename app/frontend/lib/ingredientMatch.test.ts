import { describe, expect, it } from 'vitest'

import { editDistance, findNearMatch, matchKey, normalize, suggestIngredients } from './ingredientMatch'

const saved = ['Tomato', 'Tomato paste', 'Cherry tomatoes', 'Green onion', 'Onion', 'Kidney beans', 'Broccoli', 'Rice']

describe('normalize', () => {
  it('lowercases and strips accents, punctuation, and extra spaces', () => {
    expect(normalize('  Jalapeño   Peppers! ')).toBe('jalapeno peppers')
  })
})

describe('matchKey', () => {
  it('ignores plurals', () => {
    expect(matchKey('Tomatoes')).toBe(matchKey('tomato'))
    expect(matchKey('Berries')).toBe(matchKey('berry'))
    expect(matchKey('Kidney Beans')).toBe(matchKey('kidney bean'))
  })

  it('leaves words ending in ss alone', () => {
    expect(matchKey('Swiss cheese')).toBe('swiss cheese')
  })
})

describe('editDistance', () => {
  it('counts a swapped pair of letters as one edit', () => {
    expect(editDistance('brocolli', 'broccoli')).toBe(2)
    expect(editDistance('tomtao', 'tomato')).toBe(1)
  })
})

describe('suggestIngredients', () => {
  it('ranks names starting with the text first, then word starts, then anywhere', () => {
    expect(suggestIngredients('on', saved)).toEqual(['Onion', 'Green onion'])
    expect(suggestIngredients('tom', saved)).toEqual(['Tomato', 'Tomato paste', 'Cherry tomatoes'])
  })

  it('suggests through plurals and typos', () => {
    expect(suggestIngredients('tomatoes', saved)).toContain('Tomato')
    expect(suggestIngredients('brocoli', saved)).toEqual(['Broccoli'])
  })

  it('matches plurals against any word in a saved name', () => {
    expect(suggestIngredients('tomatos', ['Diced tomatoes', 'Garlic'])).toEqual(['Diced tomatoes'])
    expect(suggestIngredients('bean', ['Kidney beans'])).toEqual(['Kidney beans'])
  })

  it('returns nothing for empty input', () => {
    expect(suggestIngredients('  ', saved)).toEqual([])
  })

  it('limits the number of suggestions', () => {
    expect(suggestIngredients('o', saved, 2)).toHaveLength(2)
  })
})

describe('findNearMatch', () => {
  it('catches plurals and typos of saved names', () => {
    expect(findNearMatch('tomatoes', saved)).toBe('Tomato')
    expect(findNearMatch('Tomatoe', saved)).toBe('Tomato')
    expect(findNearMatch('kidney bean', saved)).toBe('Kidney beans')
    expect(findNearMatch('brocoli', saved)).toBe('Broccoli')
  })

  it('ignores differences in capitalization only', () => {
    expect(findNearMatch('TOMATO', saved)).toBeNull()
  })

  it("doesn't flag short words one letter apart", () => {
    expect(findNearMatch('Ice', saved)).toBeNull()
    expect(findNearMatch('Rica', saved)).toBeNull()
  })

  it('returns null for genuinely new ingredients', () => {
    expect(findNearMatch('Garlic', saved)).toBeNull()
  })
})
