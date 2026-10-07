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
- Colors: use the semantic roles from `application.css` (`bg-surface`, `text-muted`, `bg-accent`, `text-danger`, ...), never raw palette classes like `text-stone-600` — dark mode (follows the OS setting) works by redefining those roles
- Shared class strings (buttons, cards, inputs) live in `app/frontend/components/ui.ts`

## Commands

- `bin/dev` — Rails on http://localhost:3000 + Vite dev server (3036), via Foreman and `Procfile.dev`
- `bin/rails test` — Ruby tests
- `npm run check` — TypeScript type-check
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

## Future (not MVP)

- Multiple users / accounts
- Swapping a single meal in a generated plan
- Ingredients / shopping lists
