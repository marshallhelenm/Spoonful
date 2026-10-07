require "test_helper"

class SessionsControllerTest < ActionDispatch::IntegrationTest
  setup { @user = users(:one) }

  test "new shows the sign-in page" do
    get new_session_path
    assert_inertia_component "sessions/new"
  end

  test "new redirects home when already signed in" do
    sign_in_as(@user)
    get new_session_path
    assert_redirected_to root_path
  end

  test "create with valid credentials signs in" do
    post session_path, params: { email_address: @user.email_address, password: "password" }

    assert_redirected_to root_path
    assert cookies[:session_id]
  end

  test "create ignores case and spaces in the email" do
    post session_path, params: { email_address: "  ONE@example.com ", password: "password" }
    assert_redirected_to root_path
  end

  test "create with invalid credentials stays signed out" do
    post session_path, params: { email_address: @user.email_address, password: "wrong" }

    assert_redirected_to new_session_path
    assert_nil cookies[:session_id]
    assert_equal "That email and password don't match an account.", flash[:alert]
  end

  test "destroy signs out" do
    sign_in_as(@user)

    delete session_path

    assert_redirected_to new_session_path
    assert_empty cookies[:session_id]
  end

  test "signed-out visitors are sent to sign in, then back where they were going" do
    get recipes_path
    assert_redirected_to new_session_path

    post session_path, params: { email_address: @user.email_address, password: "password" }
    assert_redirected_to recipes_url
  end

  test "pages share the signed-in user's email" do
    sign_in_as(@user)
    get recipes_path
    assert_equal "one@example.com", inertia.props[:current_user][:email_address]
    assert_equal false, inertia.props[:current_user][:demo]
  end

  test "pages flag the demo account so it can show a banner" do
    sign_in_as(DemoAccount.user)
    get recipes_path
    assert_equal true, inertia.props[:current_user][:demo]
  end
end
