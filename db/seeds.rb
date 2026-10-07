# Development sample data: a demo account with sample recipes.
# Safe to run repeatedly: `bin/rails db:seed`. Sign in as the demo user below.
demo = User.find_or_create_by!(email_address: "demo@example.com") do |user|
  user.password = "spoonful-demo"
end

SampleRecipes.add_to(demo)
