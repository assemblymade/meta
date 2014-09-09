Sidekiq.configure_server do |config|
  config.server_middleware do |chain|
    chain.remove Sidekiq::Middleware::Server::Logging
    chain.add Sidekiq::Middleware::LogStats
  end
end

module Sidekiq
  module Logging
    class Pretty
      def call(severity, time, program_name, message)
        # heroku doesn't need timestamp and process id, strip em out!
        "TID-#{Thread.current.object_id.to_s(36)}#{context} #{severity}: #{message}\n"
      end
    end
  end
end

ActiveJob::Base.queue_adapter = :sidekiq