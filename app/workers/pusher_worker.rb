class PusherWorker
  include Sidekiq::Worker

  PUSHER_CHANNEL_LIMIT = 100

  def perform(channels, event, payload, options={})
    channels.each_slice(PUSHER_CHANNEL_LIMIT).each do |channels|
      Pusher.trigger(channels, event, payload, options)
    end
  end
end
