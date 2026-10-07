export type FlashData = {
  notice?: string
  alert?: string
}

export type SharedProps = {}

export type IngredientLine = {
  name: string
  amount: string | null
}

export type Recipe = {
  id: number
  name: string
  spoons: number
  meals_covered: number
  notes: string | null
  ingredients: IngredientLine[]
}

export type RecipeWithHistory = Omit<Recipe, 'ingredients'> & {
  last_made_on: string | null
  ingredient_count: number
}

export type MealPlanSummary = {
  id: number
  starts_on: string
  meal_count: number
  spoon_budget: number
  max_spoons: number | null
  budget_is_ceiling: boolean
  total_spoons: number
  meals_planned: number
}

export type MealPlanEntry = Pick<Recipe, 'id' | 'name' | 'spoons' | 'meals_covered'> & {
  entry_id: number
}

export type RecipeOption = Pick<Recipe, 'id' | 'name' | 'spoons'>

export type MealPlan = MealPlanSummary & {
  entries: MealPlanEntry[]
}
