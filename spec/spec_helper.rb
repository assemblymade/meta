ENV['RAILS_ENV'] ||= 'test'
ENV['READRAPTOR_URL'] ||= 'https://readraptor.com'

require File.expand_path("../../config/environment", __FILE__)

require 'simplecov'
require 'rspec/rails'
require 'rspec/autorun'
require 'capybara/rspec'
require 'email_spec'
require 'sidekiq/testing'
require 'webmock/rspec'
require 'codeclimate-test-reporter'
require 'capybara/poltergeist'

Capybara.register_driver :poltergeist do |app|
  Capybara::Poltergeist::Driver.new(
    app,
    js_errors: true,
    timeout: 120,
    phantomjs_options: ['--load-images=no'],
    phantomjs_logger: Logger.new('/dev/null') # STDOUT
  )
end

Capybara.javascript_driver = :poltergeist

CodeClimate::TestReporter.start

SimpleCov.start

WebMock.disable_net_connect!(allow_localhost: true)

# Requires supporting ruby files with custom matchers and macros, etc,
# in spec/support/ and its subdirectories.
Dir[Rails.root.join("spec/support/**/*.rb")].each { |f| require f }

ActiveRecord::Migration.maintain_test_schema!

RSpec.configure do |config|
  config.use_transactional_fixtures = false
  config.infer_base_class_for_anonymous_controllers = false
  config.order = 'random'

  config.include(EmailSpec::Helpers)
  config.include(EmailSpec::Matchers)
  config.include(SpecHelpers)
  config.include(Warden::Test::Helpers)

  config.before(:suite) do
    DatabaseCleaner.clean_with(:truncation)

    Warden.test_mode!
  end

  config.before(:each) do
    DatabaseCleaner.strategy = :transaction
  end

  config.before(:each, js: true) do
    DatabaseCleaner.strategy = :truncation
  end

  config.before(:each) do |example_method|
    ActionMailer::Base.deliveries.clear

    DatabaseCleaner.start

    Sidekiq::Worker.clear_all
    # Get the current example from the example_method object

    example = example_method.example
    if example.metadata[:sidekiq] == :fake
      Sidekiq::Testing.fake!
    elsif example.metadata[:sidekiq] == :inline
      Sidekiq::Testing.inline!
    elsif example.metadata[:type] == :acceptance
      Sidekiq::Testing.inline!
    else
      Sidekiq::Testing.fake!
    end

    Warden.test_reset!
  end

  config.after(:each) do
    DatabaseCleaner.clean
  end
end
