# The shared, public demo login (listed in the README). Anyone can sign in and
# change its recipes, so production resets it nightly with `bin/rails demo:reset`
# (Heroku Scheduler). Its email and password can't be changed (see User).
class DemoAccount
  EMAIL = "demo@example.com"
  PASSWORD = "spoonful-demo"

  def self.user
    User.find_or_create_by!(email_address: EMAIL) { |user| user.password = PASSWORD }
  end

  # Wipes the demo account's plans, recipes, and ingredients and reloads the
  # sample recipes. Visitors who are signed in stay signed in.
  def self.reset!
    user = self.user
    user.transaction do
      # Same order as User's dependent destroys: plans reference recipes, recipes reference ingredients.
      user.meal_plans.destroy_all
      user.recipes.destroy_all
      user.ingredients.destroy_all
      SampleRecipes.add_to(user)
    end
    user
  end
end
