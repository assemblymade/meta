class NotifyMentions < ActiveJob::Base
  queue_as :default

  def perform(channels, event, payload, options={})
    Pusher.trigger(channels, event, payload, options)
  end
end
