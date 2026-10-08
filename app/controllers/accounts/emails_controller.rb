class Accounts::EmailsController < InertiaController
  include AccountChange
  account_change_actions :update

  def update
    return unless current_password_confirmed?

    if Current.user.update(params.permit(:email_address))
      redirect_to account_path, notice: "Your email is now #{Current.user.email_address}."
    else
      redirect_to account_path, inertia: { errors: Current.user.errors }
    end
  end
end
