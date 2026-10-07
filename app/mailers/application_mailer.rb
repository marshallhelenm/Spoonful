class ApplicationMailer < ActionMailer::Base
  # Set MAILER_FROM in production to an address on a domain you send mail from.
  default from: ENV.fetch("MAILER_FROM", "Spoonful <no-reply@example.com>")
  layout "mailer"
end
