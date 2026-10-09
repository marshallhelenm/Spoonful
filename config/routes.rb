Rails.application.routes.draw do
  resource :session, only: %i[new create destroy]
  get "sign_up", to: "registrations#new"
  post "sign_up", to: "registrations#create"
  resources :passwords, param: :token
  # Settings for the signed-in user: /account, /account/email, /account/password.
  resource :account, only: %i[show destroy] do
    scope module: :accounts do
      resource :email, only: :update
      resource :password, only: :update
    end
  end
  # Redirect to localhost from 127.0.0.1 to use same IP address with Vite server
  constraints(host: "127.0.0.1") do
    get "(*path)", to: redirect { |params, req| "#{req.protocol}localhost:#{req.port}/#{params[:path]}" }
  end

  root "meal_plans#new"

  resources :recipes, except: :show do
    resource :plan_inclusion, only: :update, module: :recipes
  end
  resources :ingredients, only: %i[index update destroy] do
    post :merge, on: :member
  end
  resources :meal_plans, only: %i[index new create show destroy] do
    post :reshuffle, on: :member
    resources :entries, only: %i[update destroy], controller: "meal_plan_entries" do
      post :shuffle, on: :member
    end
    resource :shopping_list, only: :show do
      resources :items, only: :update, controller: "shopping_list_items", param: :ingredient_id
    end
  end

  # Emails "sent" in development (e.g. password resets) show up here.
  mount LetterOpenerWeb::Engine, at: "/letter_opener" if Rails.env.development?

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
end
