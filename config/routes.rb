Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  devise_for :users, controllers: { invitations: 'users/invitations' }
  get '404', to: 'application#error'
  get '422', to: 'application#error'
  get '500', to: 'application#error'
  get :maintenance, to: 'application#maintenance'
  get 'robots.txt', to: 'application#robots', defaults: { format: :txt }

  # ===== ADMIN ROUTES ===== #
  admin_domains = Rails.env.development? ? %w[admin.localhost admin.omicron.local admin.wemeditate.co] : %w[admin.wemeditate.co]
  constraints DomainConstraint.new(admin_domains) do
    get '/', to: redirect('/en')
    get 'switch_user' => 'switch_user#set_current_user'

    scope ':locale' do
      namespace :admin, path: nil do
        root to: 'application#dashboard'
        get :vimeo_data, to: 'application#vimeo_data', constraints: { format: :json }

        resources :treatments, :categories, :mood_filters, :instrument_filters, :goal_filters, :duration_filters, only: [] do
          put :sort, on: :collection
        end

        resources :articles, :static_pages, :subtle_system_nodes, :treatments, except: %i[destroy] do
          get :write, on: :member
          get :review, on: :member
          patch :approve, on: :member, path: 'review'
          get :preview, on: :member
          resources :media_files, only: %i[create]
        end

        resources :meditations, only: [] do
          get :preview, on: :member
        end

        resources :articles, :treatments, only: %i[destroy]

        resources :users, :artists, :meditations, :tracks, :authors,
                  :categories, :mood_filters, :instrument_filters, :goal_filters, :duration_filters,
                  only: %i[index new edit create update destroy]
      end
    end
  end

  # ===== FRONT-END ROUTES ===== #
  constraints DomainConstraint.new(RouteTranslator.config.host_locales.keys) do
    localized do
      root to: 'application#home'
      post :contact, to: 'application#contact'
      post :subscribe, to: 'application#subscribe'
      get :map, to: 'application#map'

      resources :articles, only: %i[show] do
        get '/category/:category_id', on: :collection, action: :index
      end

      resources :meditations, only: %i[index show] do
        get :archive, on: :collection
        get :random, on: :collection
        post :find, on: :collection
        post :record_view, on: :member
      end

      resources :categories, only: %i[index show], path: 'inspiration'
      resources :treatments, only: %i[index show], path: 'techniques'
      resources :tracks, only: %i[index], path: 'music'
      resources :static_pages, only: %i[show], path: 'page'
      resources :subtle_system_nodes, only: %i[index show], path: 'subtle_system'
    end
  end

  get '/', to: redirect('404')
end
