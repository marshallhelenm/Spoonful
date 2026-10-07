class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy

  # Deletion order matters: plans reference recipes, and recipes reference ingredients.
  has_many :meal_plans, dependent: :destroy
  has_many :recipes, dependent: :destroy
  has_many :ingredients, dependent: :destroy

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  validates :email_address, presence: true, uniqueness: { message: "already has an account. Try signing in instead" },
                            format: { with: URI::MailTo::EMAIL_REGEXP, message: "doesn't look like an email address" }
  validates :password, length: { minimum: 8 }, allow_nil: true
  validate :demo_login_unchanged, on: :update

  def demo?
    email_address == DemoAccount::EMAIL
  end

  private
    # The demo login is public, so nobody gets to lock everyone else out of it.
    def demo_login_unchanged
      return unless email_address_in_database == DemoAccount::EMAIL

      errors.add(:email_address, "can't be changed on the demo account") if will_save_change_to_email_address?
      errors.add(:password, "can't be changed on the demo account") if will_save_change_to_password_digest?
    end
end
