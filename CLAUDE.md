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
- `spoon_budget`: a **target**, not a hard cap — get as close as possible, over or under
- A recipe's spoons count **once** per use, even if it covers several meals (you cook it once)
- **No repeats within a plan**, except 0-spoon fillers (`Recipe#filler?`), which may repeat (takeout twice is fine)
- If the last pick covers more meals than slots remain, allow it — the extra meals are leftovers
- **Recency weighting**: prefer recipes not made recently, but recent ones still have a non-zero chance
- "Last made" is derived from past meal plan entries (no separate field for now)

## Future (not MVP)

- Multiple users / accounts
- Swapping a single meal in a generated plan
- Ingredients / shopping lists
