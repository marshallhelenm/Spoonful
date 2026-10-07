require "test_helper"

class PasswordsControllerTest < ActionDispatch::IntegrationTest
  setup { @user = users(:one) }

  test "new shows the reset request page" do
    get new_password_path
    assert_inertia_component "passwords/new"
  end

  test "create emails a reset link" do
    post passwords_path, params: { email_address: @user.email_address }

    assert_enqueued_email_with PasswordsMailer, :reset, args: [ @user ]
    assert_redirected_to new_session_path
    assert_match "we've sent a link", flash[:notice]
  end

  test "create for an unknown email sends nothing but says the same thing" do
    post passwords_path, params: { email_address: "missing-user@example.com" }

    assert_enqueued_emails 0
    assert_redirected_to new_session_path
    assert_match "we've sent a link", flash[:notice]
  end

  test "create never emails the demo account" do
    post passwords_path, params: { email_address: DemoAccount.user.email_address }

    assert_enqueued_emails 0
    assert_match "we've sent a link", flash[:notice]
  end

  test "edit shows the new password page" do
    get edit_password_path(@user.password_reset_token)
    assert_inertia_component "passwords/edit"
  end

  test "edit with an invalid token" do
    get edit_password_path("invalid token")

    assert_redirected_to new_password_path
    assert_match "invalid or has expired", flash[:alert]
  end

  test "update sets the new password and signs out other sessions" do
    @user.sessions.create!
    assert_changes -> { @user.reload.password_digest } do
      put password_path(@user.password_reset_token), params: { password: "a-new-password" }
    end
    assert_redirected_to new_session_path
    assert_empty @user.sessions
  end

  test "update rejects a short password" do
    token = @user.password_reset_token
    assert_no_changes -> { @user.reload.password_digest } do
      put password_path(token), params: { password: "short" }
    end
    assert_redirected_to edit_password_path(token)
    follow_redirect!
    assert inertia.props[:errors][:password].present?
  end

  test "update rejects a blank password" do
    token = @user.password_reset_token
    assert_no_changes -> { @user.reload.password_digest } do
      put password_path(token), params: { password: "" }
    end
    assert_redirected_to edit_password_path(token)
  end
end
