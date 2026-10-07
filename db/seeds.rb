# Sample recipes for development. Safe to run repeatedly: `bin/rails db:seed`.
[
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
].each do |attrs|
  Recipe.find_or_create_by!(name: attrs[:name]) { |recipe| recipe.assign_attributes(attrs) }
end

# Sample ingredient lists (only for recipes that don't have any yet).
{
  "Big pot chili" => [ [ "Ground beef", "1 lb" ], [ "Kidney beans", "2 cans" ], [ "Diced tomatoes", "1 can" ],
                       [ "Onion", "1" ], [ "Garlic", "3 cloves" ], [ "Chili powder", "2 tbsp" ] ],
  "Weeknight pasta" => [ [ "Spaghetti", "1 lb" ], [ "Garlic", "2 cloves" ], [ "Olive oil", "1/4 cup" ],
                         [ "Parmesan", "to taste" ] ],
  "Quesadillas" => [ [ "Flour tortillas", "4" ], [ "Cheddar cheese", "1 cup" ], [ "Black beans", "1 can" ] ],
  "Stir fry" => [ [ "Rice", "1 cup" ], [ "Broccoli", "1 head" ], [ "Soy sauce", "3 tbsp" ], [ "Garlic", "2 cloves" ],
                  [ "Ginger", "1 inch" ] ],
  "Lentil soup" => [ [ "Red lentils", "1 1/2 cups" ], [ "Onion", "1" ], [ "Carrot", "2" ], [ "Cumin", "1 tsp" ],
                     [ "Vegetable broth", "6 cups" ] ]
}.each do |recipe_name, lines|
  recipe = Recipe.find_by(name: recipe_name)
  next if recipe.nil? || recipe.recipe_ingredients.any?

  recipe.save_with_ingredients(lines.map { |name, amount| { name: name, amount: amount } })
end
