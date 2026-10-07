# frozen_string_literal: true

class InertiaController < ApplicationController
  # The signed-in user (or nil), available to every page as `current_user`.
  inertia_share current_user: -> {
    authenticated? ? Current.user.as_json(only: %i[id email_address]).merge("demo" => Current.user.demo?) : nil
  }
end
