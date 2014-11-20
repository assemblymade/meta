ASM::Application.configure do
  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = (ENV['CACHING'] == 'true')

  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = false

  config.action_mailer.default_url_options = {
    host: 'localhost.assembly.com',
    port: 5000
  }

  Rails.application.routes.default_url_options = config.action_mailer.default_url_options

  if ENV['MAILGUN_API_KEY']
    config.action_mailer.delivery_method = :mailgun
    config.action_mailer.mailgun_settings = {
      :api_key  => ENV['MAILGUN_API_KEY'],
      :domain => ENV['MAILGUN_DOMAIN']
    }
  end

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise an error on page load if there are pending migrations
  config.active_record.migration_error = :page_load

  # Debug mode disables concatenation and preprocessing of assets.
  # This option may cause significant delays in view rendering with a large
  # number of complex assets.
  config.assets.debug = false

  config.react.variant = :development

  # config.middleware.use StackProf::Middleware,
  #                           enabled: true,
  #                           mode: :cpu,
  #                           interval: 1000,
  #                           save_every: 5
end
