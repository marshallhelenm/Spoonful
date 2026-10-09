export type FlashData = {
  notice?: string
  alert?: string
}

export type CurrentUser = {
  id: number
  email_address: string
  demo: boolean
}

export type SharedProps = {
  current_user: CurrentUser | null
}

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
  // Off keeps the recipe out of automatically picked meals.
  include_in_plans: boolean
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

export type ShoppingListUse = {
  recipe_name: string
  amount: string | null
  // How many times the recipe is in the plan.
  times: number
}

export type ShoppingListItem = {
  ingredient_id: number
  name: string
  checked: boolean
  uses: ShoppingListUse[]
}
