# Sign up: create an account and sign straight in.
class RegistrationsController < InertiaController
  allow_unauthenticated_access
  before_action :redirect_if_signed_in, only: :new
  rate_limit_attempts back_to: :sign_up_path

  def new
    render inertia: {}
  end

  def create
    user = User.new(params.permit(:email_address, :password))

    if user.save
      start_new_session_for user
      redirect_to root_path, notice: "Welcome to Spoonful! Start by adding a few recipes."
    else
      redirect_to sign_up_path, inertia: { errors: user.errors }
    end
  end
end
