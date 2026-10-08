require "test_helper"

class AccountsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    sign_in_as @user
  end

  test "show needs a signed-in user" do
    sign_out
    get account_path
    assert_redirected_to new_session_path
  end

  test "show renders the settings page" do
    get account_path
    assert_inertia_component "accounts/show"
  end

  # Email

  test "changing the email with the right password" do
    patch account_email_path, params: { email_address: "New@Example.com", current_password: "password" }

    assert_redirected_to account_path
    assert_equal "new@example.com", @user.reload.email_address
  end

  test "changing the email with the wrong password does nothing" do
    patch account_email_path, params: { email_address: "new@example.com", current_password: "wrong" }

    follow_redirect!
    assert_equal [ "isn't right" ], inertia.props[:errors][:current_password]
    assert_equal "one@example.com", @user.reload.email_address
  end

  test "changing to an email that already has an account" do
    patch account_email_path, params: { email_address: users(:two).email_address, current_password: "password" }

    follow_redirect!
    assert_equal [ "already has an account" ], inertia.props[:errors][:email_address]
  end

  # Password

  test "changing the password keeps this session and signs out the others" do
    this_session = Current.session
    other_session = @user.sessions.create!

    patch account_password_path, params: { current_password: "password", password: "a-new-password" }

    assert_redirected_to account_path
    assert @user.reload.authenticate("a-new-password")
    assert Session.exists?(this_session.id)
    assert_not Session.exists?(other_session.id)
  end

  test "changing the password with the wrong current password does nothing" do
    patch account_password_path, params: { current_password: "wrong", password: "a-new-password" }

    follow_redirect!
    assert_equal [ "isn't right" ], inertia.props[:errors][:current_password]
    assert @user.reload.authenticate("password")
  end

  test "changing to a blank or short password shows an error" do
    patch account_password_path, params: { current_password: "password", password: "" }
    follow_redirect!
    assert_equal [ "can't be blank" ], inertia.props[:errors][:password]

    patch account_password_path, params: { current_password: "password", password: "short" }
    follow_redirect!
    assert inertia.props[:errors][:password].present?
    assert @user.reload.authenticate("password")
  end

  # Deleting

  test "deleting the account with the right password removes it and signs out" do
    assert_difference -> { User.count } => -1, -> { Recipe.where(user: @user).count } => -3 do
      delete account_path, params: { current_password: "password" }
    end

    assert_redirected_to new_session_path
    assert cookies[:session_id].blank?
  end

  test "deleting the account with the wrong password keeps it" do
    assert_no_difference -> { User.count } do
      delete account_path, params: { current_password: "wrong" }
    end

    follow_redirect!
    assert_equal [ "isn't right" ], inertia.props[:errors][:current_password]
  end

  # Demo account

  test "the demo account can't be changed or deleted" do
    demo = DemoAccount.user
    sign_in_as demo

    patch account_email_path, params: { email_address: "mine@example.com", current_password: DemoAccount::PASSWORD }
    assert_redirected_to account_path
    patch account_password_path, params: { current_password: DemoAccount::PASSWORD, password: "a-new-password" }
    assert_no_difference -> { User.count } do
      delete account_path, params: { current_password: DemoAccount::PASSWORD }
    end

    follow_redirect!
    assert_match "demo account", flash[:alert]
    demo.reload
    assert_equal DemoAccount::EMAIL, demo.email_address
    assert demo.authenticate(DemoAccount::PASSWORD)
  end
end
