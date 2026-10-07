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
end
