module Authentication
  extend ActiveSupport::Concern

  included do
    before_action :require_authentication
    helper_method :authenticated?
  end

  class_methods do
    def allow_unauthenticated_access(**options)
      skip_before_action :require_authentication, **options
    end

    # Limits form posts (sign in, sign up, reset requests, account changes) to
    # 10 per 3 minutes, sending visitors over the limit back to `back_to`.
    def rate_limit_attempts(back_to:, only: :create)
      rate_limit to: 10, within: 3.minutes, only:,
                 with: -> { redirect_to send(back_to), alert: "Too many attempts. Try again in a few minutes." }
    end
  end

  private
    def authenticated?
      resume_session
    end

    def require_authentication
      resume_session || request_authentication
    end

    def resume_session
      Current.session ||= find_session_by_cookie
    end

    def find_session_by_cookie
      Session.find_by(id: cookies.signed[:session_id]) if cookies.signed[:session_id]
    end

    # For the sign-in and sign-up pages, which make no sense once signed in.
    def redirect_if_signed_in
      redirect_to root_path if authenticated?
    end

    def request_authentication
      session[:return_to_after_authenticating] = request.url if request.get?
      redirect_to new_session_path
    end

    def after_authentication_url
      session.delete(:return_to_after_authenticating) || root_url
    end

    def start_new_session_for(user)
      user.sessions.create!(user_agent: request.user_agent, ip_address: request.remote_ip).tap do |session|
        Current.session = session
        cookies.signed.permanent[:session_id] = { value: session.id, httponly: true, same_site: :lax }
      end
    end

    def terminate_session
      Current.session.destroy
      cookies.delete(:session_id)
    end
end
