class SessionsController < InertiaController
  allow_unauthenticated_access only: %i[ new create ]
  before_action :redirect_if_signed_in, only: :new
  rate_limit_attempts back_to: :new_session_path

  def new
    render inertia: {}
  end

  def create
    if user = User.authenticate_by(params.permit(:email_address, :password))
      start_new_session_for user
      redirect_to after_authentication_url
    else
      redirect_to new_session_path, alert: "That email and password don't match an account."
    end
  end

  def destroy
    terminate_session
    redirect_to new_session_path, status: :see_other
  end
end
