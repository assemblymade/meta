require File.expand_path('../boot', __FILE__)
require 'rails/all'

require './lib/mailgun/rails'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(:default, Rails.env)

STDOUT.sync = true

require 'elasticsearch/rails/lograge'
module ASM
  class Application < Rails::Application

    I18n.enforce_available_locales = false

    # Serve static assets. Heroku needs this for production.
    config.serve_static_files = true

    if ENV['ASSET_HOST']
      config.action_controller.asset_host = ENV['ASSET_HOST']
      config.action_mailer.asset_host = ENV['ASSET_HOST']
    end

    config.generators do |g|
      g.orm :active_record
      g.test_framework :rspec, :fixure => false
      g.stylesheets false
      g.helpers false
    end

    config.assets.paths << config.root.join('app', 'templates')

    config.react.addons = true

    config.exceptions_app = self.routes

    config.autoload_paths << config.root.join('lib')
    config.autoload_paths << config.root.join('app', 'workers')

    config.middleware.use "EsProxy"

    config.action_mailer.default_options = {
      from: "Assembly <notifications@assemblymail.com>"
    }

    config.action_mailer.preview_path = Rails.root.join('spec', 'mailers', 'preview')

    config.i18n.load_path += Dir[Rails.root.join('config', 'locales', '**/*.{rb,yml}').to_s]

    console do
      require 'console_helpers'
      require 'string_colors'
      Rails::ConsoleMethods.send :include, ASM::Console
    end

    config.active_record.raise_in_transactional_callbacks = true

    config.middleware.insert_before 0, 'Rack::Cors' do
      allow do
        origins '*'

        resource '/assets/*',
          headers: :any,
          methods: [:get, :options, :head]
      end
    end
  end
end
