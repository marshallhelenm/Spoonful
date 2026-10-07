# Checks that a linked record belongs to the same user as another record on
# the model, so nothing can point at another account's data:
#
#   validates :recipe, same_owner_as: :meal_plan
#
# Both records need a `user_id`. Skipped while either is missing (belongs_to
# already requires them). The error reads "must be one of your recipes".
class SameOwnerAsValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    other = record.public_send(options[:with])
    return if value.nil? || other.nil? || value.user_id == other.user_id

    record.errors.add(attribute, options[:message] || "must be one of your #{attribute.to_s.pluralize}")
  end
end
