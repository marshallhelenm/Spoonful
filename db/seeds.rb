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
