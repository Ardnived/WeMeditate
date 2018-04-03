Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  devise_for :users

  get 'switch_user' => 'switch_user#set_current_user'

  scope ':locale' do
    localized do
      root to: 'application#front'
      post :subscribe, to: 'application#subscribe'

      resources :articles, only: [:index, :show], path: 'inspiration' do
        get '/category/:category_id', on: :collection, action: :index
      end

      resources :cities, only: [:show, :index]
      resources :categories, only: [:show] # TODO: Remove this
      resources :meditations, only: [:index, :show]
      resources :treatments, only: [:index, :show]
      resources :tracks, only: [:index], path: 'music'
      resources :static_pages, only: [:show], path: '/'

      namespace :admin do
        root to: 'application#dashboard'

        resources :articles, :static_pages do
          patch :review, on: :member
        end

        resources :cities do
          get :lookup, on: :collection, constraints: { format: 'json' }
          patch :review, on: :member
        end

        resources :users, :artists, :treatments, :meditations, :tracks,
                  only: [:index, :create, :update, :destroy]

        resources :categories, :mood_filters, :instrument_filters, :goal_filters, :duration_filters,
                  only: [:index, :create, :update, :destroy] do
          put :sort, on: :collection
        end
      end
    end
  end

end
