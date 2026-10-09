import { afterEach, describe, expect, it, vi } from 'vitest'

import { getRecipeSort, saveRecipeSort, sortRecipes } from './recipeSort'

const recipes = [
  { name: 'stir fry', spoons: 3 },
  { name: 'Apple crumble', spoons: 2 },
  { name: 'Takeout', spoons: 0 },
  { name: 'Big pot chili', spoons: 3 },
]
const names = (sorted: { name: string }[]) => sorted.map((recipe) => recipe.name)

describe('sortRecipes', () => {
  it('sorts by name either way, ignoring case', () => {
    expect(names(sortRecipes(recipes, 'name-asc'))).toEqual(['Apple crumble', 'Big pot chili', 'stir fry', 'Takeout'])
    expect(names(sortRecipes(recipes, 'name-desc'))).toEqual(['Takeout', 'stir fry', 'Big pot chili', 'Apple crumble'])
  })

  it('sorts by spoons either way, keeping ties A–Z', () => {
    expect(names(sortRecipes(recipes, 'spoons-asc'))).toEqual(['Takeout', 'Apple crumble', 'Big pot chili', 'stir fry'])
    expect(names(sortRecipes(recipes, 'spoons-desc'))).toEqual([
      'Big pot chili',
      'stir fry',
      'Apple crumble',
      'Takeout',
    ])
  })

  it("doesn't change the original list", () => {
    sortRecipes(recipes, 'spoons-asc')
    expect(recipes[0].name).toBe('stir fry')
  })
})

describe('saved sort', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('remembers the last sort and defaults to A–Z', () => {
    const items = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => items.get(key) ?? null,
      setItem: (key: string, value: string) => void items.set(key, value),
    })

    expect(getRecipeSort()).toBe('name-asc')
    saveRecipeSort('spoons-desc')
    expect(getRecipeSort()).toBe('spoons-desc')
    items.set('spoonful-recipe-sort', 'nonsense')
    expect(getRecipeSort()).toBe('name-asc')
  })

  it('falls back to A–Z when storage is unavailable', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    })

    expect(getRecipeSort()).toBe('name-asc')
    expect(() => saveRecipeSort('spoons-asc')).not.toThrow()
  })
})
