require "test_helper"

class RegistrationsControllerTest < ActionDispatch::IntegrationTest
  test "new shows the sign-up page" do
    get sign_up_path
    assert_inertia_component "registrations/new"
  end

  test "create makes an account and signs in" do
    assert_difference -> { User.count } do
      post sign_up_path, params: { email_address: "New@Example.com", password: "a-good-password" }
    end

    assert_redirected_to root_path
    assert cookies[:session_id]
    assert_equal "new@example.com", User.order(:created_at).last.email_address
  end

  test "create with a taken email suggests signing in" do
    assert_no_difference -> { User.count } do
      post sign_up_path, params: { email_address: users(:one).email_address, password: "a-good-password" }
    end
    assert_redirected_to sign_up_path
    follow_redirect!
    assert_equal [ "already has an account. Try signing in instead" ], inertia.props[:errors][:email_address]
  end

  test "create with a short password shows an error" do
    post sign_up_path, params: { email_address: "new@example.com", password: "short" }
    follow_redirect!
    assert inertia.props[:errors][:password].present?
  end
end
