class PusherWorker
  include Sidekiq::Worker

  def perform(channels, event, payload)
    Rails.logger.info "  [Pusher] #{channels} #{event} #{payload}"
    Pusher.trigger(channels, event, payload)
  end
end
