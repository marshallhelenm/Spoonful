# Shared by the account settings controllers. Every change asks for the
# current password, so a device left signed in isn't enough to take over or
# delete the account; wrong guesses are rate limited like sign-in. The shared
# demo account can't be changed at all.
module AccountChange
  extend ActiveSupport::Concern

  class_methods do
    # Declares which actions make changes (named per controller, since each
    # has only some of them and missing callback actions raise).
    def account_change_actions(*actions)
      before_action :refuse_demo_account, only: actions
      rate_limit_attempts back_to: :account_path, only: actions
    end
  end

  private
    def refuse_demo_account
      redirect_to account_path, alert: "The demo account can't be changed or deleted." if Current.user.demo?
    end

    # True if params[:current_password] is right; otherwise redirects back
    # with an error on that field and returns false.
    def current_password_confirmed?
      return true if Current.user.authenticate(params[:current_password].to_s)

      redirect_to account_path, inertia: { errors: { current_password: [ "isn't right" ] } }
      false
    end
end
