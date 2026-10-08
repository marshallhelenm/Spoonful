# Account settings page, and deleting the account.
class AccountsController < InertiaController
  include AccountChange
  account_change_actions :destroy

  def show
    render inertia: {}
  end

  def destroy
    return unless current_password_confirmed?

    Current.user.destroy!
    cookies.delete(:session_id)
    redirect_to new_session_path, status: :see_other, notice: "Your account and everything in it have been deleted."
  end
end
