export type FlashData = {
  notice?: string
  alert?: string
}

export type SharedProps = {}

export type Recipe = {
  id: number
  name: string
  spoons: number
  meals_covered: number
  notes: string | null
}

export type RecipeWithHistory = Recipe & {
  last_made_on: string | null
}

export type MealPlanSummary = {
  id: number
  starts_on: string
  meal_count: number
  spoon_budget: number
  total_spoons: number
  meals_planned: number
}

export type MealPlanEntry = Pick<Recipe, 'id' | 'name' | 'spoons' | 'meals_covered'> & {
  entry_id: number
}

export type MealPlan = MealPlanSummary & {
  entries: MealPlanEntry[]
}
