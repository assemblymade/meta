require 'sidekiq/web'

ASM::Application.routes.draw do

  # api
  # ◕ᴥ◕
  namespace :api, path: '/', constraints: { subdomain: 'api' }, defaults: { format: 'json' } do
    get '/', to: 'api#root'
    resource :user, only: [:show]

    resource :users do
      get '/:user_id/ownership', to: 'users#ownership'
      get '/:user_id', to: 'users#info'
      get '/:user_id/core', to: 'users#core'
    end

    resources :orgs, only: [:show] do
      resources :bounties, only: [:index, :show, :create, :update] do
        resources :awards, only: [:create, :show]
      end
    end

    resources :orgs do
      get '/partners', to: 'orgs#partners'
    end
  end

  authenticate :user, lambda { |u| u.staff? } do
    mount Sidekiq::Web => '/admin/sidekiq'
    mount Split::Dashboard => '/admin/split'
    mount PgHero::Engine => "/admin/postgres"
  end

  if Rails.env.development?
    get "/impersonate/:id", to: "users#impersonate", as: :impersonate
  end

  authenticated do
    get '/', to: redirect('/dashboard')
  end

  # Global Chat Experiment
  resources :chat_rooms, only: [:index, :show], path: 'chat'

  get '/still-field', to: redirect('/discover') # bad product

  # Bugfix. Read more at https://assembly.com/meta/198
  get '/webhooks/pusher', to: redirect('/discover')

  # Internal
  get '/playground/:action', controller: 'playground'

  # Single sign-on
  get '/sso', to: 'single_sign_on#sso'

  # Legacy
  get '/discover/blog', to: redirect('/discover/updates')
  get '/explore', to: redirect('/discover')
  get '/blog',    to: redirect('http://blog.assembly.com')

  # Pages (some use JS router)
  get '/home',     to: 'pages#home',     as: :home
  get '/about',    to: 'pages#about',    as: :about
  get '/terms',    to: 'pages#tos',      as: :tos
  get '/badges',   to: 'pages#badges',   as: :badges
  get '/activity', to: 'activity#index', as: :activity

  get '/getting-started',  to: 'pages#getting-started', as: :getting_started

  # Readraptor proxy. Remove this when javascript clients can talk directly to RR
  get '/_rr/articles/:id', to: 'readraptor#show', as: :readraptor_article

  get '/create', to: 'products#new',    as: :new_product
  get '/start',  to: 'products#start',  as: :start_idea
  get '/import', to: 'products#import', as: :import_idea

  get '/styleguide', to: 'pages#styleguide'

  get '/discover(.:format)', to: 'apps#index', as: :discover

  resources :ideas do
    get '/start-conversation', on: :member, action: :start_conversation
    get '/admin', on: :member, action: :admin
    patch '/admin', on: :member, action: :admin_update
    patch :mark
    patch '/up_score', to: 'ideas#up_score'
    patch '/down_score', to: 'ideas#down_score'
    get '/checklistitems', to: 'ideas#checklistitems'
  end

  devise_for :users,
    :skip => [:registrations, :sessions, :confirmations],
    :controllers => { :omniauth_callbacks => "users/omniauth_callbacks", :passwords => 'users/passwords' }

  as :user do
    # Sessions
    get    '/login',  to: 'users/sessions#new', as: :new_user_session
    post   '/login',  to: 'users/sessions#create'
    get    '/user',   to: 'users/sessions#show', as: :user_session
    delete '/logout', to: 'users/sessions#destroy', as: :destroy_user_session

    # Registrations
    controller 'users/registrations' do
      get  '/signup', action: :new, as: :new_user_registration
      post '/signup', action: :create, as: :user_registration
    end

    get '/dashboard', to: 'dashboard#index', as: :dashboard
    get '/dashboard/:filter', to: 'dashboard#index', as: :dashboard_filter

    # settings
    get    '/settings',               to: 'users#edit', as: :edit_user
    patch  '/settings',               to: 'users/registrations#update'
    get    '/settings/email',         to: 'users/registrations#edit_email', as: :edit_user_email
    get    '/settings/profile',       to: 'users/profiles#edit', as: :edit_user_profile
    get    '/settings/notifications', to: "users/notifications#edit", as: :settings_notifications
    patch  '/settings/notifications', to: "users/notifications#update"

    namespace :users, path: 'user' do
      resource :balance, only: [:show] { post :withdraw }
      resource :payment_option, only: [:show, :create, :update]
      resource :tax_info, only: [:show, :create, :update] do
        get ':form_type', to: 'tax_infos#show'
      end
    end

    # Confirmation
    get    '/users/confirmation/new', to: 'users/confirmations#new', as: :new_user_confirmation
    get    '/users/confirmation',     to: 'users/confirmations#show', as: :user_confirmation
    post   '/users/confirmation',     to: 'users/confirmations#create'

    resources :users, only: [:show, :update] do
      get :awarded_bounties, on: :member
      patch :flag, on: :member
      get :heart_stories, on: :member
      patch :unflag, on: :member
      patch :delete_account, on: :member
    end

    get 'users/:id/stories', to: 'users#stories'
    get 'users/:id/stories/:product_id', to: 'users#stories'
    get '/users/:id/karma',  to: 'users#karma',  as: :user_karma
    get '/users/:id/assets', to: 'users#assets', as: :user_assets
    post '/users/:id/dismiss_welcome_banner',  to: 'users#dismiss_welcome_banner', as: :dismiss_welcome_banner
    post '/users/:id/dismiss_showcase_banner', to: 'users#dismiss_showcase_banner', as: :dismiss_showcase_banner

    resources :notifications, only: [:index]
    resources :choices, only: [:index, :create, :update, :destroy]

    # saved searches
    scope '/user', controller: 'users' do
      get :unread
      get 'tracking/:article_id', to: 'users#tracking', as: :readraptor

      resources :saved_searches, only: [:create, :destroy]

      resources :invites, only: [:create]
    end
  end

  # heartables
  post 'heartables/love', as: :love
  get  'heartables/hearts'
  get  'heartables/:heartable_id/lovers', controller: :heartables, action: :lovers, as: :heartables_lovers

  resources :stories, only: [:show]

  get '/leaderboards', to: 'leaderboards#index'

  # Webhooks
  namespace :webhooks do
    post '/assembly_assets/transaction', to: 'assembly_assets#transaction'
    post '/mailgun', to: 'mailgun#create'
    post '/mailgun/reply', to: 'mailgun#reply'
    post '/github', to: 'github#create'
    post '/landline', to: 'landline#create'
    post '/readraptor/immediate/:entity_id', to: 'read_raptor#immediate', as: :readraptor_immediate
    post '/readraptor/daily',          to: 'read_raptor#daily'
    post '/readraptor/unread_comment', to: 'read_raptor#unread_coment', as: :readraptor_unread_comment
    post '/pusher', to: 'pusher#auth'
  end

  # Facebook
  get '/channel.html', to: 'facebook#channel', as: :facebook_channel

  # Exceptions
  get "/404", to: "errors#not_found"
  get "/500", to: "errors#error"
  get "/errors/crash", to: "errors#test_exception"
  get "/errors/maintenance", to: "errors#maintenance"
  get "/errors/heroku", to: "errors#test_heroku"

  resources :tags, only: [] do
    post 'follow'
    post 'unfollow'
  end

  # Help
  get '/help/:group', to: 'questions#index', as: :help
  get '/help', to: redirect('/help/basics'), as: :faq

  get '/metrics', to: 'metrics#overview'

  # Guides
  get '/guides/:group', to: 'guides#index', as: :guides
  get '/guides', to: 'guides#index'

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
    get '/bitcoin/report', to: 'bitcoin#report'
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
    resources :withdrawals, only: [:index, :update] do
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

    get '/', to: redirect('/admin/withdrawals')
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

    post '/sb', to: 'slack_bridge#receive'

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

  root 'pages#home'

  post '/products', to: 'products#create', as: :products

  get '/products/:id', to: redirect(ProductRedirector.new), as: :full_product
  get '/products/:product_id/discussions/:id', to: redirect(ProductRedirector.new(:discussion)), as: :full_product_discussion
  get '/products/:product_id/tasks/:id', to: redirect(ProductRedirector.new(:task)), as: :full_product_task

  get '/activities/:id', to: 'activity#show'
  get '/hotbounties', to: 'hot_bounties#show'

  get '/interests/:interest', to: 'global_interests#toggle', as: :global_interests
  get '/hello/:id', to: 'hellos#show', as: :hello_user

  # custom oauth :(
  get '/integrations/:provider/token', to: 'integrations#token'
  get '/integrations/:provider/callback', to: 'integrations#callback'
  get '/:product_id/integrations/:provider/authorize', to: 'integrations#authorize', as: :product_integrations
  put '/:product_id/integrations/:provider/update', to: 'integrations#update'

  # legacy
  get '/meta/chat', to: redirect(path: '/chat/general')

  # FIXME: Fix news_feed_items_controller to allow missing product
  get '/news_feed_items', to: 'dashboard#news_feed_items'
  resources :news_feed_items, only: [] do
    patch :update_task
  end

  resources :discussions, only: [] do
    resources :comments, only: [:index, :create, :update]
  end

  resource :user, only: [:update] do
    get :after_sign_up
  end

  # Products
  resources :products, path: '/', except: [:index, :create, :destroy] do

    match 'flag',    via: [:get, :post]

    get '/transactions', to: 'financials#transactions'

    get 'welcome'
    get 'activity'
    get 'admin'
    post 'feature'
    post 'follow'
    post 'announcements'
    post 'unfollow'

    post 'make_idea'
    post '/greenlight', to: 'products#greenlight'

    get '/checklistitems', to: 'products#checklistitems'
    get '/ownership', to: 'products#ownership'
    get '/coin', to: 'products#coin'
    get '/stories', to: 'products#stories'

    get '/trust', to: 'products#trust'

    get 'log', to: 'stakes#show'
    get 'search', to: 'search#index'
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
      put 'tasks/:id', to: 'projects#add'
      resources :tasks, only: [:create, :destroy, :show, :update]

      patch :images
      patch :add
    end

    resources :screenshots, only: [:create]
    resources :people, only: [:index, :create, :update, :destroy]
    resources :core_team_members, only: [:create]

    get '/core', to: 'core_team_members#index'

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
      get 'search', :on, action: :collection

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

    resource :financial, :module, action: :financial  do
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
