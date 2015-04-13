require 'sidekiq/web'

ASM::Application.routes.draw do

  # api
  # ◕ᴥ◕
  namespace :api, path: '/', constraints: { subdomain: 'api' }, defaults: { format: 'json' } do
    get '/' => 'api#root'
    resource :user, only: [:show]
    resources :orgs, only: [:show] do
      resources :bounties, only: [:index, :show, :create, :update] do
        resources :awards, only: [:create, :show]
      end
    end
  end

  authenticate :user, lambda { |u| u.staff? } do
    mount Sidekiq::Web => '/admin/sidekiq'
    mount Split::Dashboard  => '/admin/split'
    mount PgHero::Engine => "/admin/postgres"
  end

  if Rails.env.development?
    get "/impersonate/:id", :to => "users#impersonate", :as => :impersonate
  end

  authenticated do
    get '/', to: redirect('/dashboard')
  end

  # Global Chat Experiment
  resources :chat_rooms, only: [:index, :show], path: 'chat'

  get '/still-field' => redirect('/discover') # bad product

  # Bugfix. Read more at https://assembly.com/meta/198
  get '/webhooks/pusher' => redirect('/discover')

  # Internal
  get '/playground/:action', controller: 'playground'

  # Single sign-on
  get '/sso' => 'single_sign_on#sso'

  # Legacy
  get '/discover/blog', to: redirect('/discover/updates')
  get '/explore', to: redirect('/discover')
  get '/blog',    to: redirect('http://blog.assembly.com')

  # Pages
  get '/home'             => 'pages#home',        as: :home
  get '/about'            => 'pages#about',       as: :about
  get '/terms'            => 'pages#tos',         as: :tos
  get '/core-team'        => 'pages#core_team',   as: :core_team
  get '/badges'           => 'pages#badges',      as: :badges
  get '/pitchweek'        => 'pages#pitch_week',  as: :pitch_week
  get '/sabbaticals'      => 'pages#sabbaticals', as: :sabbaticals
  get '/activity'         => 'activity#index',    as: :activity

  get '/getting-started'  => 'pages#getting-started', as: :getting_started

  # Readraptor proxy. Remove this when javascript clients can talk directly to RR
  get '/_rr/articles/:id' => 'readraptor#show', as: :readraptor_article

  get '/create'        => 'products#new',    :as => :new_product
  get '/start'         => 'products#start',  :as => :start_idea

  get '/styleguide' => 'pages#styleguide'

  get '/discover(.:format)' => 'apps#index', as: :discover

  resources :ideas do
    get '/start-conversation', on: :member, action: :start_conversation
    get '/admin', on: :member, action: :admin
    patch '/admin', on: :member, action: :admin_update
    patch :mark
    patch '/up_score' => 'ideas#up_score'
    patch '/down_score' => 'ideas#down_score'
    get '/checklistitems' => 'ideas#checklistitems'
  end

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
      get  '/signup', action: :new, as: :new_user_registration
      post '/signup', action: :create, as: :user_registration
    end

    get '/dashboard' => 'dashboard#index', as: :dashboard
    get '/dashboard/:filter' => 'dashboard#index', as: :dashboard_filter

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
    end

    # Confirmation
    get    '/users/confirmation/new' => 'users/confirmations#new', :as => :new_user_confirmation
    get    '/users/confirmation' => 'users/confirmations#show', :as => :user_confirmation
    post   '/users/confirmation' => 'users/confirmations#create'

    resources :users, only: [:show, :update] do
      get :awarded_bounties, on: :member
      patch :flag, on: :member
      get :heart_stories, on: :member
      patch :unflag, on: :member
      patch :delete_account, on: :member
    end

    get '/users/:id/karma' => 'users#karma', :as => :user_karma
    get '/users/:id/assets' => 'users#assets', :as => :user_assets
    post '/users/:id/dismiss_welcome_banner' => 'users#dismiss_welcome_banner', :as => :dismiss_welcome_banner
    post '/users/:id/dismiss_showcase_banner' => 'users#dismiss_showcase_banner', :as => :dismiss_showcase_banner

    resources :notifications, only: [:index]
    resources :choices, only: [:index, :create, :update, :destroy]

    # saved searches
    scope '/user', controller: 'users' do
      get :unread
      get 'tracking/:article_id' => 'users#tracking', :as => :readraptor

      resources :saved_searches, only: [:create, :destroy]

      resources :invites, only: [:create]
    end
  end

  # heartables
  post 'heartables/love', as: :love
  get  'heartables/hearts'
  get  'heartables/:heartable_id/lovers', controller: :heartables, action: :lovers, as: :heartables_lovers

  resources :stories, only: [:show]

  get '/leaderboards' => 'leaderboards#index'

  # Webhooks
  namespace :webhooks do
    post '/assembly_assets/transaction' => 'assembly_assets#transaction'
    post '/mailgun' => 'mailgun#create'
    post '/mailgun/reply' => 'mailgun#reply'
    post '/github' => 'github#create'
    post '/landline' => 'landline#create'
    post '/readraptor/immediate/:entity_id' => 'read_raptor#immediate', as: :readraptor_immediate
    post '/readraptor/daily'          => 'read_raptor#daily'
    post '/readraptor/unread_comment' => 'read_raptor#unread_coment', as: :readraptor_unread_comment
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

  get '/metrics' => 'metrics#overview'

  # Guides
  get '/guides/:group', :to => 'guides#index', :as => :guides
  get '/guides', :to => 'guides#index'

  # redirect support-foo to helpful
  get '/support-foo', to: redirect('/helpful')
  get '/support-foo/*extra', to: redirect {|p, req| "/helpful/#{p[:extra]}" }

  # Admin
  namespace :admin do
    resources :apps, only: [:index, :update]
    resources :asset_history, only: [:index]
    resources :bitcoin, only: [:index] do
      get '/report', action: :report
    end
    get '/bitcoin/report' => 'bitcoin#report'
    resources :bounties, only: [:index] do
      get :graph_data
    end
    resources :karma, only: [:index]
    resources :leaderboard, only: [:index]
    resources :ownership, only: [:index, :update]
    resources :tags, only: [:index]
    resources :user_books, only: [:index]
    resources :profit_reports, path: 'profit-reports', only: [:index, :show]
    resources :product_rankings, path: 'products', only: [:index, :update]
    resources :withdrawals, only: [:index] do
      patch :payment_sent
    end
    resources :pitch_week_applications, path: 'pitch-week', only: [:index] do
      patch :approve
      patch :decline
    end
    resources :newsletters do
      patch :publish
    end
    resources :users

    get '/' => redirect('/admin/withdrawals')
  end

  scope :upload do
    resources :attachments, only: [:create]
  end

  # Old api
  namespace :api do
    resources :chat_rooms, path: 'chat' do
      resources :comments, only: [:create, :index], module: :chat
      resources :users, only: [:index], module: :chat, path: 'online'
    end

    post '/sb' => 'slack_bridge#receive'

    resources :products, only: [] do
      get :info
      get :workers

      get :core_team
      get :authorization
      namespace :chat do
        resources :comments, only: [:create]
      end

      resources :partners, only: [:index]

      resources :bounties, only: [:index, :create] do
        resources :offers, only: [:create, :show]
        resources :awards, only: [:create, :show]
      end

      resources :updates, only: [:index] do
        get :paged, on: :collection
      end

      resources :news_feed_items, only: [:show, :create], path: 'updates', as: :updates
      resources :projects, only: [:create]
      resources :subscribers, only: [:create, :destroy]
      resources :bounty_postings, only: [:create, :destroy]

      # deprecate (launchpad)
      resources :potential_users, controller: 'subscribers', only: [:create, :destroy]

    end

    resources :textcompletes, only: [:index]
  end

  root :to => 'pages#home'

  post '/products' => 'products#create', as: :products

  get '/products/:id', to: redirect(ProductRedirector.new), as: :full_product
  get '/products/:product_id/discussions/:id', to: redirect(ProductRedirector.new(:discussion)), as: :full_product_discussion
  get '/products/:product_id/tasks/:id', to: redirect(ProductRedirector.new(:task)), as: :full_product_task

  get '/activities/:id' => 'activity#show'
  get '/hotbounties' => 'hot_bounties#show'

  get '/interests/:interest' => 'global_interests#toggle', as: :global_interests
  get '/hello/:id' => 'hellos#show', as: :hello_user

  # custom oauth :(
  get '/integrations/:provider/token' => 'integrations#token'
  get '/integrations/:provider/callback' => 'integrations#callback'
  get '/:product_id/integrations/:provider/authorize' => 'integrations#authorize', as: :product_integrations
  put '/:product_id/integrations/:provider/update' => 'integrations#update'

  # legacy
  get '/meta/chat', to: redirect(path: '/chat/general')

  # FIXME: Fix news_feed_items_controller to allow missing product
  get '/news_feed_items' => 'dashboard#news_feed_items'
  resources :news_feed_items, only: [] do
    patch :update_task
  end

  resources :discussions, only: [] do
    resources :comments, only: [:index, :create, :update]
  end

  resource :user, only: [:update]

  # Products
  resources :products, path: '/', except: [:index, :create, :destroy] do

    match 'flag',    via: [:get, :post]

    get '/transactions' => 'financials#transactions'

    get 'welcome'
    get 'activity'
    get 'admin'
    post 'feature'
    post 'follow'
    post 'announcements'
    post 'unfollow'

    post 'make_idea'
    post '/greenlight' => 'products#greenlight'

    get '/checklistitems' => 'products#checklistitems'
    get '/ownership' => 'products#ownership'
    get '/people' => 'products#people'
    get '/coin' => 'products#coin'
    get '/stories' => 'products#stories'

    get '/trust' => 'products#trust'

    get 'log' => 'stakes#show'
    get 'search' => 'search#index'
    patch :launch

    get :old
    get :plan

    resources :assets
    resources :watchers

    resources :payments, only: [:index, :create, :update, :destroy]
    resources :expense_claims, only: [:create]
    resources :product_logos, only: [:index, :show, :create, :update], as: :logos, path: 'logos'
    resources :news_feed_item_posts, only: [:show]
    resources :projects, only: [:index, :show, :new, :create, :edit, :update] do
      put 'tasks/:id' => 'projects#add'
      resources :tasks, only: [:create, :destroy, :show, :update]

      patch :images
      patch :add
    end

    resources :screenshots, only: [:create]
    resources :people, only: [:index, :create, :update, :destroy]
    resources :core_team_members, only: [:create]

    get '/core' => 'core_team_members#index'

    resources :discussions, only: [:index, :show, :new, :edit, :create, :update] do
      patch :close, on: :member
      resources :comments, only: [:show, :create, :edit, :update]
    end

    resources :news_feed_items, only: [:index, :show, :update], path: 'updates', as: :updates do
      patch :subscribe
      patch :unsubscribe
      patch 'popularize'
      patch 'depopularize'

      resources :news_feed_item_comments, only: [:index, :create, :update], as: :comments, path: 'comments'
    end

    resources :repositories, only: [:index, :create, :destroy], as: :repos
    resources :team_memberships, path: 'memberships', only: [:show]
    resources :tasks, only: [:show, :new], path: 'bounties' do
      resources :awards, only: [:show]
    end
    resources :wips, only: [:index, :show, :new, :edit, :create, :update], controller: 'tasks', path: 'bounties' do
      get 'search', :on => :collection

      get   'checkin'
      patch 'assign'
      patch 'stop_work'
      patch 'review'
      patch 'reject'
      patch 'award', :action => :award, :on => :member
      post 'promote'
      post 'demote'
      patch 'watch'
      patch 'mute'
      get 'mute'
      patch 'tag'
      patch 'flag'
      patch 'unflag'
      patch 'close'
      patch 'reopen'
      patch 'lock'
      patch 'unlock'

      resources :comments, only: [:show, :create, :edit, :update]
    end

    resources :tips, only: [:create]

    resources :contracts, only: [:index, :create, :update, :destroy]
    resources :domains, only: [:create]
    resources :metrics, only: [:index] do
      get :daily, on: :collection
      get :weekly, on: :collection
      get :snippet, on: :collection
    end

    resources :governance, only: [:index, :create, :edit, :show]
    resources :proposals, only: [:index, :create, :edit, :update, :destroy, :show]
    resources :resources, only: [:index]

    resources :posts do
      post :paged, on: :collection
    end
    resources :status_messages, only: [:create]

    resources :partners, only: [:index]
    resources :financials, only: [:index]

    resource :financial, :module => :financial  do
      resources :accounts, only: [:index, :show]
      resources :transactions, only: [:index, :show, :new, :create]
    end

    resources :work

    # legacy
    get :chat, to: redirect('/chat/%{product_id}')
    get :team, to: redirect(path: '%{product_id}/people')
    get :welcome, to: redirect(path: '%{product_id}')
    get '/wips', to: redirect(path: '/%{product_id}/bounties')
    get '/wips/*all', to: redirect(path: '/%{product_id}/bounties/%{all}')

    get '/:number', to: redirect(path: '%{product_id}/wips/%{number}'),
      constraints: {number: /\d+/},
      as: :shortcut
  end
end
