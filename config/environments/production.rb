ASM::Application.configure do
  # Code is not reloaded between requests.
  config.cache_classes = true

  # Eager load code on boot. This eager loads most of Rails and
  # your application in memory, allowing both thread web servers
  # and those relying on copy on write to perform better.
  # Rake tasks automatically ignore this option for performance.
  config.eager_load = true

  # Full error reports are disabled and caching is turned on.
  config.consider_all_requests_local       = false
  config.action_controller.perform_caching = true

  # Enable Rack::Cache to put a simple HTTP cache in front of your application
  # Add `rack-cache` to your Gemfile before enabling this.
  # For large-scale production use, consider using a caching reverse proxy like nginx, varnish or squid.
  # config.action_dispatch.rack_cache = true

  # Compress JavaScripts and CSS.
  config.assets.js_compressor = :uglifier
  # config.assets.css_compressor = :sass

  # Fallback to assets pipeline if a precompiled asset is missed.
  config.assets.compile = true

  # Prevent initializing the app and connecting to the database
  config.assets.initialize_on_precompile = false

  # Generate digests for assets URLs.
  config.assets.digest = true

  # Version of your assets, change this if you want to expire all your assets.
  config.assets.version = '1.0'

  # Specifies the header that your server uses for sending files.
  # config.action_dispatch.x_sendfile_header = "X-Sendfile" # for apache
  # config.action_dispatch.x_sendfile_header = 'X-Accel-Redirect' # for nginx

  # Force all access to the app over SSL, use Strict-Transport-Security, and use secure cookies.
  config.force_ssl = true

  # Set to :debug to see everything in the log.
  config.log_level = :info

  # Prepend all log lines with the following tags.
  # config.log_tags = [ :subdomain, :uuid ]

  # Use a different logger for distributed setups.
  # config.logger = ActiveSupport::TaggedLogging.new(SyslogLogger.new)

  # Use a different cache store in production.
  config.cache_store = :dalli_store

  # Configure Rack::Cache (rack middleware, whole page / static assets) (we set
  # value_max_bytes to 10MB, most memcache servers won't allow values larger
  # than 1MB but this stops Rack::Cache returning a 5xx error. With this
  # option, Rack::Cache just returns a miss).
  client = Dalli::Client.new(ENV['MEMCACHIER_SERVERS'], value_max_bytes: 10485760)
  config.action_dispatch.rack_cache = { metastore: client, entitystore: client }

  # Precompile additional assets.
  # application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
  # config.assets.precompile += %w( search.js )

  # Ignore bad email addresses and do not raise email delivery errors.
  # Set this to true and configure the email server for immediate delivery to raise delivery errors.
  # config.action_mailer.raise_delivery_errors = false
  config.action_mailer.default_url_options = {
    host: 'assemblymade.com',
    protocol: 'https'
  }
  Rails.application.routes.default_url_options[:host] = config.action_mailer.default_url_options[:host]
  Rails.application.routes.default_url_options[:protocol] = config.action_mailer.default_url_options[:protocol]

  config.action_mailer.delivery_method = :mailgun
  config.action_mailer.mailgun_settings = {
    api_key: ENV['MAILGUN_API_KEY'],
    domain:  ENV['MAILGUN_DOMAIN']
  }
  ActionMailer::Base.default from: 'Assembly <team@assemblymade.com>'

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation can not be found).
  config.i18n.fallbacks = true

  # Send deprecation notices to registered listeners.
  config.active_support.deprecation = :notify

  config.lograge.enabled = true

  config.static_cache_control = "public, max-age=31536000"

  config.react.variant = :production
end
