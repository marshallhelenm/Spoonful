class PasswordsController < InertiaController
  allow_unauthenticated_access
  before_action :set_user_by_token, only: %i[ edit update ]
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { redirect_to new_password_path, alert: "Too many attempts. Try again in a few minutes." }

  def new
    render inertia: {}
  end

  def create
    if user = User.find_by(email_address: params[:email_address])
      PasswordsMailer.reset(user).deliver_later
    end

    redirect_to new_session_path, notice: "If there's an account with that email, we've sent a link to reset the password."
  end

  def edit
    render inertia: { token: params[:token] }
  end

  def update
    # has_secure_password silently ignores a blank password, so check for one explicitly.
    if params[:password].blank?
      redirect_to edit_password_path(params[:token]), inertia: { errors: { password: [ "can't be blank" ] } }
    elsif @user.update(params.permit(:password))
      @user.sessions.destroy_all
      redirect_to new_session_path, notice: "Your password has been reset. Sign in with the new one."
    else
      redirect_to edit_password_path(params[:token]), inertia: { errors: @user.errors }
    end
  end

  private
    def set_user_by_token
      @user = User.find_by_password_reset_token!(params[:token])
    rescue ActiveSupport::MessageVerifier::InvalidSignature
      redirect_to new_password_path, alert: "That password reset link is invalid or has expired. Request a new one."
    end
end
