class PusherWorker
  include Sidekiq::Worker

  def perform(channels, event, payload, options={})
    Pusher.trigger(channels, event, payload, options)
  end
end
