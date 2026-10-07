# A `name` that's unique per user, ignoring case and extra spaces: "Tomato"
# and " tomato " are the same name. Used by Recipe and Ingredient.
module UniqueNamePerUser
  extend ActiveSupport::Concern

  included do
    normalizes :name, with: ->(name) { name.squish }

    validates :name, presence: true, uniqueness: { scope: :user_id, case_sensitive: false }

    # Records with this name, ignoring case and extra spaces. Call it on one
    # user's records: user.recipes.named("big pot chili").
    scope :named, ->(name) { where("lower(name) = ?", normalize_value_for(:name, name).downcase) }
  end
end
