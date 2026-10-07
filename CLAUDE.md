# Spoonful

A meal planner that budgets *effort* (spoons) instead of money. The user saves recipes with a spoon rating, then asks for a week's meal plan that targets a spoon budget for that week.

## Stack

- Rails 8.1 (Ruby 4.0.3 via chruby, pinned in `.ruby-version`) + Inertia.js + React 19 (TypeScript), Vite via `vite_ruby`, Tailwind v4
- SQLite
- One responsive, mobile-first web app (no separate mobile build); PWA later maybe
- Single user for MVP; no auth until the MVP works
- Generated without Hotwire, Jbuilder, Action Mailbox, Action Text

## Layout

- React pages: `app/frontend/pages/<controller>/<action>.tsx`, rendered from controllers with `render inertia: ...`
- Vite entrypoints: `app/frontend/entrypoints/` (`inertia.tsx`, `application.css`)
- Colors: use the semantic roles from `application.css` (`bg-surface`, `text-muted`, `bg-accent`, `text-danger`, ...), never raw palette classes like `text-stone-600` — dark mode works by redefining those roles. Theme follows the OS unless the footer switcher sets `<html data-theme>` (saved in localStorage; see `app/frontend/lib/theme.ts`)
- Shared class strings (buttons, cards, inputs) live in `app/frontend/components/ui.ts`
- Fonts: Bagel Fat One for titles (`font-display`, single weight — always `font-normal`), Quicksand variable for everything else. Body weight is 500 (medium) because Quicksand's 400 is thin; use `font-semibold`/`font-bold` for emphasis

## Commands

- `bin/dev` — Rails on http://localhost:3000 + Vite dev server (3036), via Foreman and `Procfile.dev`
- `bin/rails test` — Ruby tests
- `npm run check` — TypeScript type-check
- `npm test` — Vitest unit tests for plain TS in `app/frontend` (`*.test.ts`)
- `bin/rails db:seed` — load sample recipes (idempotent)

**Shell note for Claude:** non-interactive shells don't load `~/.zshrc`, so chruby isn't active and `ruby`/`rails` resolve to the macOS system Ruby 2.6. Run Ruby commands through `zsh -ic '...'`.

## MVP domain rules

**Recipe**
- `name`, `spoons` (0–5), `meals_covered` (integer ≥ 1, e.g. a big batch covers 2 meals), optional notes
- 0-spoon "meals" (takeout, leftovers, frozen pizza) are ordinary recipes with `spoons: 0`

**Meal plan**
- `meal_count`: number of meals to plan; default **14** (lunch + dinner × 7), user can change it
- `spoon_budget`: a **target** by default — get as close as possible, over or under
- `budget_is_ceiling` (default off): never exceed the budget; recipes that would push past it are skipped, even if meals go unfilled
- `max_spoons` (optional, 0–5): per-plan cap — no single recipe harder than this. Off (NULL) by default, so one hard meal can land in a light week
- A recipe's spoons count **once** per use, even if it covers several meals (you cook it once)
- **No repeats within a plan**, except 0-spoon fillers (`Recipe#filler?`), which may repeat (takeout twice is fine)
- If the last pick covers more meals than slots remain, allow it — the extra meals are leftovers
- **Recency weighting**: prefer recipes not made recently, but recent ones still have a non-zero chance
- "Last made" is derived from past meal plan entries (no separate field for now)

**Ingredients**
- `Ingredient` is a shared catalog of names, unique ignoring case (`lower(name)` index); `RecipeIngredient` links a recipe to an ingredient with an optional free-text `amount` and a `position`
- `Recipe#save_with_ingredients(lines)` saves the recipe and replaces its list in one transaction; `nil` lines leave the list alone (so partial updates don't wipe it)
- The form suggests saved names as you type and asks "did you mean …?" for plural/typo near-matches (`app/frontend/lib/ingredientMatch.ts`); the user can keep their spelling
- Ingredients stay in the catalog when no recipe uses them (still useful for suggestions)

**Shopping list** (per meal plan, `ShoppingList` PORO + `/meal_plans/:id/shopping_list`)
- One item per ingredient across the plan's recipes, listing each recipe's amount ("Garlic noodles: 6 cloves · Stir fry: 2 cloves"); amounts are free text, so they aren't summed. A recipe planned twice shows "×2"
- Checkmarks are saved server-side (`ShoppingListCheck` row = checked) so they follow you across devices; the page updates optimistically and sends `async` Inertia requests so rapid taps don't cancel each other
- Recipes in the plan with no ingredients (excluding 0-spoon fillers) are listed with links to add them

## Future (not MVP)

- **Planned next:** ingredient management (rename / merge duplicates / delete unused), then up/down reordering of ingredient rows on the recipe form
- **Maybe later:** structured amounts (separate number + unit) so the shopping list can add up totals — keep `ShoppingList` uses as data, not pre-formatted strings, to make that switch easy
- Multiple users / accounts
