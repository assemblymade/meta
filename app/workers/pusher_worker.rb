class PusherWorker < ActiveJob::Base
  queue_as :default

  PUSHER_CHANNEL_LIMIT = 100

  def perform(channels, event, payload, options={})
    Rails.logger.info "  [Pusher] #{channels} #{event} #{payload} #{options}"
    Array(channels).each_slice(PUSHER_CHANNEL_LIMIT).each do |channels|
      Pusher.trigger(channels, event, payload, options)
    end
  end
end
