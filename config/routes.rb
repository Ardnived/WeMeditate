Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  get :maintenance, to: 'application#maintenance'
  get 'switch_user' => 'switch_user#set_current_user' if Rails.env.development?

  # ===== ADMIN ROUTES ===== #
  constraints DomainConstraint.new(Rails.configuration.admin_domain) do
    devise_for :users, controllers: { invitations: 'users/invitations', sessions: 'users/sessions', passwords: 'users/passwords' }

    get '404', to: 'admin/application#error'
    get '422', to: 'admin/application#error'
    get '500', to: 'admin/application#error'

    get '/', to: redirect('/en')

    scope ':locale' do
      namespace :admin, path: nil do
        root to: 'application#dashboard'
        get :tutorial, to: 'application#tutorial'
        get :vimeo_data, to: 'application#vimeo_data', constraints: { format: :json }

        resources :treatments, :categories, :mood_filters, :instrument_filters, :goal_filters, :duration_filters, only: [] do
          put :sort, on: :collection
        end

        resources :meditations, only: [] do
          get :preview, on: :member
        end

        resources :articles, :static_pages, :subtle_system_nodes, :treatments, :streams, except: %i[destroy] do
          get :write, on: :member
          get :review, on: :member
          patch :approve, on: :member, path: 'review'
          get :preview, on: :member
          get :audit, on: :member
          resources :media_files, only: %i[create]
        end

        resources :articles, :treatments, :streams, only: %i[destroy]
        resources :users, :artists, :meditations, :tracks, :authors,
                  :categories, :mood_filters, :instrument_filters, :goal_filters, :duration_filters,
                  only: %i[index new edit create update destroy]
      end
    end
  end

  # ===== FRONT-END ROUTES ===== #
  constraints DomainConstraint.new(RouteTranslator.config.host_locales.keys) do
    get 'surrey', to: redirect('/live/surrey')
    
    localized do
      devise_for :users, controllers: { invitations: 'users/invitations' }

      root to: 'application#home'
      get 'robots.txt', to: 'robots#txt'
      get 'sitemap.xml.gz', to: 'application#sitemap'
      get '404', to: 'application#error'
      get '422', to: 'application#error'
      get '500', to: 'application#error'

      post :contact, to: 'application#contact'
      post :subscribe, to: 'application#subscribe'
      get :map, to: 'application#map'
      get :classes, to: 'application#classes'
      get :live, to: 'streams#index'

      resources :articles, only: %i[show] do
        get '/category/:category_id', on: :collection, action: :index
      end

      resources :meditations, only: %i[index show] do
        get :self_realization, on: :collection
        get :archive, on: :collection
        get :random, on: :collection
        post :find, on: :collection
        post :record_view, on: :member
      end

      resources :categories, only: %i[index show], path: 'inspiration'
      resources :treatments, only: %i[index show], path: 'techniques'
      resources :tracks, only: %i[index], path: 'music'
      resources :subtle_system_nodes, only: %i[index show], path: 'subtle_system'
      resources :streams, only: %i[index show], path: 'streams'
      resources :static_pages, only: %i[show], path: ''
    end
  end

  get 'robots.txt', to: 'robots#txt'
  get '404', to: 'application#error'
  get '422', to: 'application#error'
  get '500', to: 'application#error'

  get '/', to: redirect('404')
end
