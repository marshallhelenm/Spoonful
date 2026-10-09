class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy

  # Deletion order matters: plans reference recipes, and recipes reference ingredients.
  has_many :meal_plans, dependent: :destroy
  has_many :recipes, dependent: :destroy
  has_many :ingredients, dependent: :destroy

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  validates :email_address, presence: true,
                            uniqueness: { message: ->(user, _) { user.new_record? ? "already has an account. Try signing in instead" : "already has an account" } },
                            format: { with: URI::MailTo::EMAIL_REGEXP, message: "doesn't look like an email address" }
  validates :password, length: { minimum: 8 }, allow_nil: true
  validate :demo_login_unchanged, on: :update
  before_destroy :keep_demo_account

  def demo?
    email_address == DemoAccount::EMAIL
  end

  # { recipe_id => start date of the latest plan it's in } across this user's
  # plans, leaving out `except` (so a plan being refilled doesn't count itself).
  # The budget of the most recently created plan, or nil if there are none yet.
  def last_spoon_budget
    meal_plans.order(created_at: :desc, id: :desc).pick(:spoon_budget)
  end

  def last_made_on_by_recipe(except: nil)
    MealPlanEntry.where(meal_plan: meal_plans.excluding(except)).last_made_on_by_recipe
  end

  private
    # The demo login is public, so nobody gets to lock everyone else out of it.
    def demo_login_unchanged
      return unless email_address_in_database == DemoAccount::EMAIL

      errors.add(:email_address, "can't be changed on the demo account") if will_save_change_to_email_address?
      errors.add(:password, "can't be changed on the demo account") if will_save_change_to_password_digest?
    end

    def keep_demo_account
      return unless demo?

      errors.add(:base, "The demo account can't be deleted")
      throw :abort
    end
end
