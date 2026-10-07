# Spoonful

A meal planner that budgets *effort* (spoons) instead of money. The user saves recipes with a spoon rating, then asks for a week's meal plan that targets a spoon budget for that week.

## Stack (decided, not yet scaffolded)

- Rails 8 + Inertia.js + React (TypeScript), Vite via `vite_ruby`
- SQLite
- One responsive, mobile-first web app (no separate mobile build); PWA later maybe
- Single user for MVP; no auth until the MVP works

## MVP domain rules

**Recipe**
- `name`, `spoons` (0–5), `meals_covered` (integer ≥ 1, e.g. a big batch covers 2 meals), optional notes
- 0-spoon "meals" (takeout, leftovers, frozen pizza) are ordinary recipes with `spoons: 0`

**Meal plan**
- `meal_count`: number of meals to plan; default **14** (lunch + dinner × 7), user can change it
- `spoon_budget`: a **target**, not a hard cap — get as close as possible, over or under
- A recipe's spoons count **once** per use, even if it covers several meals (you cook it once)
- **No repeats within a plan** (see open question about 0-spoon fillers)
- **Recency weighting**: prefer recipes not made recently, but recent ones still have a non-zero chance
- "Last made" is derived from past meal plan entries (no separate field for now)

## Open questions

- Can 0-spoon fillers repeat within a week (e.g. takeout twice)? Leaning yes.
- If the last pick covers more meals than slots remain, allow overflow (leftovers) or skip it?

## Future (not MVP)

- Multiple users / accounts
- Swapping a single meal in a generated plan
- Ingredients / shopping lists
