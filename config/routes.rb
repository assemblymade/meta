require 'sidekiq/web'

ASM::Application.routes.draw do

  authenticate :user, lambda { |u| u.staff? } do
    mount Sidekiq::Web => '/admin/sidekiq'
    mount Split::Dashboard  => '/admin/split'
    mount PgHero::Engine => "/admin/postgres"
  end

  if Rails.env.development?
    get "/impersonate/:id", :to => "users#impersonate", :as => :impersonate
  end

  authenticated do
    get '/', to: redirect('/discover')
  end

  root :to => 'pages#home'

  get '/home2' => 'pages#home2'

  # Talk Experiment
  get '/talk'  => 'talk#index', :as => :chat

  get '/still-field' => redirect('/discover') # bad product

  # Bugfix. Read more at https://assembly.com/meta/198
  get '/webhooks/pusher' => redirect('/discover')

  # Internal
  get '/styleguide' => 'styleguide#index'
  get '/playground/:action', controller: 'playground'

  # Legacy
  get '/explore', to: redirect('/discover')
  get '/ideas',   to: redirect('/discover')
  get '/blog',    to: redirect('http://blog.assembly.com')

  # Pages
  get '/home'             => 'pages#home',        as: :home
  get '/about'            => 'pages#about',       as: :about
  get '/terms'            => 'pages#tos',         as: :tos
  get '/core-team'        => 'pages#core_team',   as: :core_team
  get '/sabbaticals'      => 'pages#sabbaticals', as: :sabbaticals
  get '/activity'         => 'activity#index',    as: :activity
  get '/getting-started'  => 'pages#getting-started', as: :getting_started
  get '/chat' => redirect('/meta/chat')

  get '/new'      => redirect('/create')
  get '/create'   => 'products#new',     :as => :new_idea
  resources :ideas, :only => [:index]

  get '/discover(/:action)', controller: 'discover',
                             as: :discover,
                             defaults: {
                               action: 'staff_picks'
                             }

  get '/discover/tech/:tech' => 'discover#tech'

  devise_for :users,
    :skip => [:registrations, :sessions, :confirmations],
    :controllers => { :omniauth_callbacks => "users/omniauth_callbacks", :passwords => 'users/passwords' }

  as :user do
    # Sessions
    get    '/login'  => 'users/sessions#new', :as => :new_user_session
    post   '/login'  => 'users/sessions#create'
    get    '/user'   => 'users/sessions#show', :as => :user_session
    delete '/logout' => 'users/sessions#destroy', :as => :destroy_user_session

    # Registrations
    controller 'users/registrations' do
      get  '/signup', action: :new, :as => :new_user_registration
      post '/signup', action: :create, :as => :user_registration
    end

    # settings
    get    '/settings' => 'users#edit', as: :edit_user
    patch  '/settings' => 'users/registrations#update'
    get    '/settings/email' => 'users/registrations#edit_email', :as => :edit_user_email
    get    '/settings/profile' => 'users/profiles#edit', :as => :edit_user_profile
    get    '/settings/notifications' => "users/notifications#edit", :as => :settings_notifications
    patch  '/settings/notifications' => "users/notifications#update"

    namespace :users, path: 'user' do
      resource :balance, only: [:show] { post :withdraw }
      resource :payment_option, only: [:show, :create, :update]
      resource :tax_info, only: [:show, :create, :update] do
        get ':form_type' => 'tax_infos#show'
      end

      resources :chat_rooms, only: [:index]
    end

    # Confirmation
    get    '/users/confirmation/new' => 'users/confirmations#new', :as => :new_user_confirmation
    get    '/users/confirmation' => 'users/confirmations#show', :as => :user_confirmation
    post   '/users/confirmation' => 'users/confirmations#create'

    get    '/users/:id' => 'users#show', :as => :user
    patch  '/users/:id' => 'users#update'

    resources :notifications, only: [:index]

    # saved searches
    scope '/user', controller: 'users' do
      get :unread
      get 'tracking/:article_id' => 'users#tracking', :as => :readraptor

      resources :saved_searches, only: [:create, :destroy]

      resources :invites, only: [:create]
    end
  end

  resources :stories, only: [:show]

  # Webhooks
  namespace :webhooks do
    post '/mailgun' => 'mailgun#create'
    post '/mailgun/reply' => 'mailgun#reply'
    post '/github' => 'github#create'
    post '/readraptor/immediate' => 'read_raptor#immediate'
    post '/readraptor/daily'     => 'read_raptor#daily'
    post '/pusher' => 'pusher#auth'
  end

  # Facebook
  get '/channel.html' => 'facebook#channel', :as => :facebook_channel

  # Exceptions
  get "/404", :to => "errors#not_found"
  get "/500", :to => "errors#error"
  get "/errors/crash", :to => "errors#test_exception"
  get "/errors/maintenance", :to => "errors#maintenance"
  get "/errors/heroku", :to => "errors#test_heroku"

  resources :tags, only: [] do
    post 'follow'
    post 'unfollow'
  end

  # Help
  get '/help/:group', :to => 'questions#index', :as => :help
  get '/help' => redirect('/help/basics'), :as => :faq

  # redirect support-foo to helpful
  get '/support-foo', to: redirect('/helpful')
  get '/support-foo/*extra', to: redirect {|p, req| "/helpful/#{p[:extra]}" }

  get '/welcome', to: 'welcome#index', as: :welcome

  # Admin
  namespace :admin do
    resources :profit_reports, path: 'profit-reports', only: [:index, :show]
    resources :staff_picks, path: 'staff-picks'
    resources :withdrawals, only: [:index] do
      patch :payment_sent
    end
    resources :newsletters do
      patch :publish
    end
    resources :users

    get '/' => redirect('/admin/staff-picks')
  end

  scope :upload do
    resources :attachments, only: [:create]
  end

  resources :metrics, only: [:create]
  # hack route for Metrics gem (/v1/metrics)
  post '/v1/metrics', to: 'metrics#create'

  # api
  # ◕ᴥ◕
  namespace :api do
    resources :products, only: [] do
      get :info
      get :workers
      namespace :chat do
        resources :comments, only: [:create]
      end
      resources :bounties, only: [] do
        resources :offers, only: [:create, :show]
      end
      resources :projects, only: [:create]
      resources :potential_users, only: [:create, :destroy]
    end

    resources :textcompletes, only: [:index]
  end

  get 'search' => 'search#index'

  post '/products' => 'products#create', as: :products

  get '/products/:id', to: redirect(ProductRedirector.new), as: :full_product
  get '/products/:product_id/discussions/:id', to: redirect(ProductRedirector.new(:discussion)), as: :full_product_discussion
  get '/products/:product_id/tasks/:id', to: redirect(ProductRedirector.new(:task)), as: :full_product_task

  get '/activities/:id' => 'activity#show'

  # Products
  resources :products, path: '/', except: [:index, :create, :destroy] do
    match 'flag',    via: [:get, :post]

    get '/chat' => 'chat#index', as: :chat
    post '/chat' => 'chat#create'

    get 'welcome'
    get 'admin'
    post 'feature'
    post 'follow'
    post 'announcements'
    post 'unfollow'
    get 'log' => 'stakes#show'
    get 'search' => 'search#index'
    patch :launch

    resources :assets
    resources :watchers

    resources :product_logos, only: [:index, :show, :create, :update], as: :logos, path: 'logos'

    resources :projects, only: [:index, :show, :new, :create, :edit, :update] do
      put 'tasks/:id' => 'projects#add'
      resources :tasks, only: [:create, :destroy, :show, :update]

      patch :images
      patch :add
    end

    resources :people, only: [:index, :create, :update, :destroy]
    resources :core_team_members, only: [:create]

    get '/core' => 'core_team_members#index'

    resources :discussions, only: [:index, :show, :new, :edit, :create, :update] do
      patch :close, on: :member
      resources :comments, only: [:show, :create, :edit, :update]
    end

    resources :repositories, only: [:index, :create, :destroy], as: :repos

    patch '/discussions/:wip_id/to_task' => 'discussions#to_task', as: :discussion_to_task
    patch '/wips/:wip_id/to_discussion' => 'tasks#to_discussion', as: :task_to_discussion

    resources :work
    resources :wips, only: [:index, :show, :new, :edit, :create, :update], controller: 'tasks' do
      get 'search', :on => :collection

      get   'checkin'
      patch 'start_work'
      patch 'stop_work'
      patch 'review'
      patch 'reject'
      patch 'award', :action => :award, :on => :member
      post 'promote'
      post 'demote'
      post 'deliverables'
      post 'copy_deliverables'
      post 'code_deliverables'
      patch 'watch'
      patch 'mute'
      patch 'tag'

      resources :comments, only: [:show, :create, :edit, :update]
    end

    resources :tasks, only: [] do
      patch 'urgency', action: :urgency, as: :urgency
    end

    resources :tips, only: [:create]

    resources :contracts, only: [:index, :create, :update, :destroy]

    resources :posts do
      post :preview, on: :collection
    end
    resources :status_messages, only: [:create]

    resources :partners, only: [:index]
    resources :financials, only: [:index]

    resource :financial, :module => :financial  do
      resources :accounts, only: [:index, :show]
      resources :transactions, only: [:index, :show, :new, :create]
    end

    # legacy
    get '/discuss', to: redirect(path: '%{product_id}/chat')
    get :team, to: redirect(path: '%{product_id}/people')
    get :welcome, to: redirect(path: '%{product_id}')

    get '/:number' => 'rooms#deprecated_redirect',
      constraints: {number: /\d+/},
      as: :shortcut
  end

end
