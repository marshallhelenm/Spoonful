class Accounts::PasswordsController < InertiaController
  include AccountChange
  account_change_actions :update

  def update
    return unless current_password_confirmed?

    # has_secure_password silently ignores a blank password, so check for one explicitly.
    if params[:password].blank?
      redirect_to account_path, inertia: { errors: { password: [ "can't be blank" ] } }
    elsif Current.user.update(params.permit(:password))
      # Stay signed in here, but sign out everywhere else.
      Current.user.sessions.excluding(Current.session).destroy_all
      redirect_to account_path, notice: "Your password has been changed. Other devices have been signed out."
    else
      redirect_to account_path, inertia: { errors: Current.user.errors }
    end
  end
end
