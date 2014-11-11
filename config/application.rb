require File.expand_path('../boot', __FILE__)
require 'rails/all'

require './lib/rack/cross_origin_assets'
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
    config.serve_static_assets = true

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

    config.middleware.insert_before ActionDispatch::Static,
                                    Rack::CrossOriginAssets

    config.action_mailer.default_options = {
      from: "Assembly <notifications@assemblymail.com>"
    }

    config.action_mailer.preview_path = Rails.root.join('spec', 'mailers', 'preview')

    config.skylight.probes = %w(net_http excon redis)

    config.i18n.load_path += Dir[Rails.root.join('config', 'locales', '**/*.{rb,yml}').to_s]

    console do
      require 'console_helpers'
      Rails::ConsoleMethods.send :include, ASM::Console
    end
  end
end
