# A starter set of recipes (some with ingredient lists) that can be added to
# any account. Used by db/seeds.rb for the demo account.
#
# Safe to run more than once: recipes the user already has (by name) are left
# alone, and ingredient lists are only filled in where a recipe has none.
class SampleRecipes
  RECIPES = [
    { name: "Takeout", spoons: 0, meals_covered: 1 },
    { name: "Leftovers", spoons: 0, meals_covered: 1 },
    { name: "Frozen pizza", spoons: 0, meals_covered: 1 },
    { name: "Toast and eggs", spoons: 1, meals_covered: 1 },
    { name: "Sandwiches", spoons: 1, meals_covered: 1 },
    { name: "Instant ramen with veggies", spoons: 1, meals_covered: 1 },
    { name: "Sheet pan sausage and veg", spoons: 2, meals_covered: 2 },
    { name: "Quesadillas", spoons: 2, meals_covered: 1 },
    { name: "Weeknight pasta", spoons: 2, meals_covered: 2 },
    { name: "Big pot chili", spoons: 3, meals_covered: 4 },
    { name: "Stir fry", spoons: 3, meals_covered: 2 },
    { name: "Lentil soup", spoons: 3, meals_covered: 4 },
    { name: "Homemade curry", spoons: 4, meals_covered: 3 },
    { name: "Lasagna", spoons: 5, meals_covered: 4 },
    { name: "Roast chicken dinner", spoons: 5, meals_covered: 3 }
  ].freeze

  INGREDIENTS = {
    "Toast and eggs" => [ [ "Bread", "2 slices" ], [ "Eggs", "2" ], [ "Butter", "1 tbsp" ] ],
    "Sandwiches" => [ [ "Bread", "4 slices" ], [ "Sliced turkey", "4 oz" ], [ "Cheddar cheese", "2 slices" ],
                      [ "Lettuce", "a few leaves" ] ],
    "Instant ramen with veggies" => [ [ "Instant ramen", "1 pack" ], [ "Eggs", "1" ], [ "Frozen peas", "1/2 cup" ],
                                      [ "Green onions", "2" ] ],
    "Sheet pan sausage and veg" => [ [ "Smoked sausage", "1 lb" ], [ "Potatoes", "1 lb" ], [ "Bell peppers", "2" ],
                                     [ "Onion", "1" ], [ "Olive oil", "2 tbsp" ] ],
    "Big pot chili" => [ [ "Ground beef", "1 lb" ], [ "Kidney beans", "2 cans" ], [ "Diced tomatoes", "1 can" ],
                         [ "Onion", "1" ], [ "Garlic", "3 cloves" ], [ "Chili powder", "2 tbsp" ] ],
    "Weeknight pasta" => [ [ "Spaghetti", "1 lb" ], [ "Garlic", "2 cloves" ], [ "Olive oil", "1/4 cup" ],
                           [ "Parmesan", "to taste" ] ],
    "Quesadillas" => [ [ "Flour tortillas", "4" ], [ "Cheddar cheese", "1 cup" ], [ "Black beans", "1 can" ] ],
    "Stir fry" => [ [ "Rice", "1 cup" ], [ "Broccoli", "1 head" ], [ "Soy sauce", "3 tbsp" ], [ "Garlic", "2 cloves" ],
                    [ "Ginger", "1 inch" ] ],
    "Lentil soup" => [ [ "Red lentils", "1 1/2 cups" ], [ "Onion", "1" ], [ "Carrot", "2" ], [ "Cumin", "1 tsp" ],
                       [ "Vegetable broth", "6 cups" ] ],
    "Homemade curry" => [ [ "Chicken thighs", "1 1/2 lbs" ], [ "Coconut milk", "1 can" ], [ "Curry paste", "3 tbsp" ],
                          [ "Onion", "1" ], [ "Garlic", "3 cloves" ], [ "Ginger", "1 inch" ], [ "Rice", "2 cups" ] ],
    "Lasagna" => [ [ "Lasagna noodles", "12" ], [ "Ground beef", "1 lb" ], [ "Marinara sauce", "1 jar" ],
                   [ "Ricotta", "15 oz" ], [ "Mozzarella", "2 cups" ], [ "Parmesan", "1/2 cup" ], [ "Eggs", "1" ] ],
    "Roast chicken dinner" => [ [ "Whole chicken", "1 (4 lb)" ], [ "Potatoes", "2 lbs" ], [ "Carrot", "4" ],
                                [ "Lemon", "1" ], [ "Garlic", "1 head" ], [ "Butter", "2 tbsp" ] ]
  }.freeze

  # Returns the number of recipes added.
  def self.add_to(user)
    user.transaction do
      added = RECIPES.count do |attrs|
        user.recipes.named(attrs[:name]).none? && user.recipes.create!(attrs)
      end

      INGREDIENTS.each do |recipe_name, lines|
        recipe = user.recipes.named(recipe_name).first
        next if recipe.nil? || recipe.recipe_ingredients.any?

        recipe.save_with_ingredients(lines.map { |name, amount| { name: name, amount: amount } })
      end

      added
    end
  end
end
