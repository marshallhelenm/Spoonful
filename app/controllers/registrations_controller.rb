# Sign up: create an account and sign straight in.
class RegistrationsController < InertiaController
  allow_unauthenticated_access
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { redirect_to sign_up_path, alert: "Too many attempts. Try again in a few minutes." }

  def new
    return redirect_to root_path if authenticated?

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
