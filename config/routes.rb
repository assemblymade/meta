require 'sidekiq/web'

ASM::Application.routes.draw do

  authenticate :user, lambda { |u| u.staff? } do
    mount Sidekiq::Web => '/admin/sidekiq'
    mount Split::Dashboard  => '/admin/split'
  end

  if Rails.env.development?
    get '/playground/:action', controller: 'playground'
    get "/impersonate/:id", :to => "users#impersonate", :as => :impersonate
  end

  authenticated do
    get '/', to: redirect('/discover')
  end

  root :to => 'pages#home'

  get '/still-field' => redirect('/discover') # bad product

  get '/styleguide' => 'styleguide#index'

  # Legacy
  get '/explore', to: redirect('/discover/products')
  get '/ideas',   to: redirect('/discover/products')
  get '/blog',    to: redirect('http://blog.assemblymade.com')

  # Pages
  get '/home'        => 'pages#home',        as: :home
  get '/terms'       => 'pages#tos',         as: :tos
  get '/core-team'   => 'pages#core_team',   as: :core_team
  get '/sabbaticals' => 'pages#sabbaticals', as: :sabbaticals
  get '/activity'    => 'activity#index',    as: :activity

  get '/new' => redirect('/start')
  get '/start'        => 'products#new',     :as => :new_idea
  resources :ideas, :only => [:index] do
    post :vote, :controller => 'ideas/votes', :action => 'create', :on => :member
  end

  get '/discover(/:action)', controller: 'discover',
                             as: :discover,
                             defaults: {
                               action: 'staff_picks'
                             }

  get '/discover/tech/:tech' => 'discover#tech'

  get '/chat' => 'messages#index', as: :chats
  resources :messages

  # Perks
  resources :perks, :only => [] do
    resources :preorders, :module => :perks, :on => :member, :only => [:new, :create]
  end


  devise_for :users,
    :skip => [:registrations, :sessions, :confirmations, :passwords],
    :controllers => { :omniauth_callbacks => "users/omniauth_callbacks", :passwords => 'users/passwords' }

  as :user do
    # Sessions
    get    '/login'  => 'users/sessions#new', :as => :new_user_session
    post   '/login'  => 'users/sessions#create'
    get    '/user'   => 'users/sessions#show', :as => :user_session
    delete '/logout' => 'users/sessions#destroy', :as => :destroy_user_session

    # Registrations
    controller 'users/registrations' do
      get  '/signup', action: :signup, :as => :new_user_registration
      get  '/signup/email', action: :new, :as => :new_user_email_registration
      post '/signup', action: :create, :as => :user_registration

      get '/welcome/tour', action: :welcome, as: :welcome_tour
    end

    # settings
    get    '/settings' => 'users#edit', as: :edit_user
    patch  '/settings' => 'users/registrations#update'
    get    '/settings/email' => 'users/registrations#edit_email', :as => :edit_user_email
    get    '/settings/profile' => 'users/profiles#edit', :as => :edit_user_profile
    get    '/settings/notifications' => "users/notifications#edit", :as => :settings_notifications
    patch  '/settings/notifications' => "users/notifications#update"
    get    '/settings/payment' => 'users/profiles#payment', :as => :user_payment
    patch  '/settings/payment' => 'users/profiles#update'

    # Confirmation
    get    '/users/confirmation/new' => 'users/confirmations#new', :as => :new_user_confirmation
    get    '/users/confirmation' => 'users/confirmations#show', :as => :user_confirmation
    post   '/users/confirmation' => 'users/confirmations#create'

    # passwords
    post   '/users/password' => 'users/passwords#create', :as => :user_password
    get    '/users/password/edit' => 'users/passwords#edit', :as => :edit_user_password
    patch  '/users/password' => 'users/passwords#update'
    put    '/users/password' => 'users/passwords#update'

    get    '/users/:id' => 'users#show', :as => :user
    patch  '/users/:id' => 'users#update'
    get    '/users/:id/unread' => 'users#unread_content'

    # saved searches
    scope '/user' do
      resources :saved_searches, only: [:create, :destroy]
    end
  end

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
  get '/help' => redirect('/help/general'), :as => :faq

  # redirect support-foo to helpful
  get '/support-foo', to: redirect('/helpful')
  get '/support-foo/*extra', to: redirect {|p, req| "/helpful/#{p[:extra]}" }

  get '/welcome', to: 'welcome#index', as: :welcome

  # Admin
  namespace :admin do
    resources :staff_picks, path: 'staff-picks'
    resources :newsletters
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
  namespace :api do
    resources :products, only: [] do
      get :workers
    end

    resources :textcompletes, only: [:index]
  end

  post '/products' => 'products#create', as: :products
  post '/products/generate-name' => 'products#generate_name'

  get '/products/:id', to: redirect(ProductRedirector.new), as: :full_product
  get '/products/:product_id/discussions/:id', to: redirect(ProductRedirector.new(:discussion)), as: :full_product_discussion
  get '/products/:product_id/tasks/:id', to: redirect(ProductRedirector.new(:task)), as: :full_product_task

  # Products
  resources :products, path: '/', except: [:index, :create, :destroy] do
    match 'flag',    via: [:get, :post]

    post 'feature'
    post 'follow'
    post 'subscribe', as: :subscribe, on: :member
    post 'unsubscribe', as: :unsubscribe, on: :member
    get 'leaderboard(/:period)', :to => 'products#leaderboard', :as => :leaderboard
    get :metrics
    get :welcome
    get '/dashboard' => 'products/dashboard#index', :as => :dashboard
    get 'log' => 'stakes#show'

    resources :milestones, only: [:index, :show, :new, :create, :edit, :update], path: 'projects' do
      put 'tasks/:id' => 'milestones#add'
      resources :tasks, only: [:create, :destroy, :show, :update]

      patch :images
      patch :add
    end

    resources :team, only: [:index, :show, :new, :edit, :create, :update], controller: 'jobs', as: :jobs  do
      get 'join'
      get 'part'
    end

    get :discuss, to: 'discussions#show', id: '0'

    resources :discussions, only: [:index, :show, :new, :edit, :create, :update] do
      resources :comments, only: [:create, :edit, :update]
    end

    patch '/discussions/:wip_id/to_task' => 'discussions#to_task', as: :discussion_to_task
    patch '/wips/:wip_id/to_discussion' => 'tasks#to_discussion', as: :task_to_discussion

    resources :work do
      delete 'votes' => 'votes#downvote_work'
      post 'votes' => 'votes#upvote_work'
    end

    resources :wips, only: [:index, :show, :new, :edit, :create, :update], controller: 'tasks' do
      get 'search', :on => :collection

      delete 'votes' => 'votes#downvote'
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

      resources :votes, only: [:create]
      resources :comments, only: [:create, :edit, :update]
    end

    resources :events, only: [] do
      resources :tips, only: [:create]
    end

    resources :core_team_members

    resources :posts do
      post :preview, on: :collection
    end
    resources :status_messages, only: [:create]

    resources :partners, only: [:index]

    resource :financial, :module => :financial  do
      resources :accounts, only: [:index, :show]
      resources :transactions, only: [:index, :show, :new, :create]
    end

    get '/:number' => 'shortcuts#show',
      constraints: {number: /\d+/},
      as: :shortcut
  end

end
