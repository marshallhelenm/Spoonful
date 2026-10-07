# Development sample data: a demo account with sample recipes.
# Safe to run repeatedly: `bin/rails db:seed`. Sign in as the demo user below.
# Adds any missing sample recipes without wiping your changes; `bin/rails demo:reset` starts it fresh.
SampleRecipes.add_to(DemoAccount.user)
