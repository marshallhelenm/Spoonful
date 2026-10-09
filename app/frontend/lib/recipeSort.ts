// Sort orders for the recipe list. The choice is saved per browser in
// localStorage, like the theme.

export type RecipeSort = 'name-asc' | 'name-desc' | 'spoons-asc' | 'spoons-desc'

type Sortable = { name: string; spoons: number }

const STORAGE_KEY = 'spoonful-recipe-sort'
const SORTS: RecipeSort[] = ['name-asc', 'name-desc', 'spoons-asc', 'spoons-desc']

// Ignores case, like the server's alphabetical order.
const compareNames = (a: Sortable, b: Sortable) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })

// A sorted copy. Recipes with the same spoons stay A–Z.
export function sortRecipes<T extends Sortable>(recipes: readonly T[], sort: RecipeSort): T[] {
  const compare: Record<RecipeSort, (a: T, b: T) => number> = {
    'name-asc': compareNames,
    'name-desc': (a, b) => compareNames(b, a),
    'spoons-asc': (a, b) => a.spoons - b.spoons || compareNames(a, b),
    'spoons-desc': (a, b) => b.spoons - a.spoons || compareNames(a, b),
  }
  return [...recipes].sort(compare[sort])
}

export function getRecipeSort(): RecipeSort {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return SORTS.find((sort) => sort === stored) ?? 'name-asc'
  } catch {
    return 'name-asc'
  }
}

export function saveRecipeSort(sort: RecipeSort) {
  try {
    localStorage.setItem(STORAGE_KEY, sort)
  } catch {
    // Storage can be unavailable (e.g. private browsing); the sort still applies for this visit.
  }
}
