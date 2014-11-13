class RegisterEventInReadraptor
  include Sidekiq::Worker
  include Rails.application.routes.url_helpers

  attr_reader :event

  def perform(event_global_id)
    @event = GlobalID::Locator.locate(event_global_id)

    # regular subscribers get 5 minutes to see the event
    unless event.wip.chat?
      register_recipients(
        event.wip.follower_ids - event.mentioned_user_ids - [event.user_id],
        1.minutes.from_now
      )
    end

    # @mentioned users get 1 minute to see it
    register_recipients(
      event.mentioned_user_ids - [event.user_id],
      10.seconds.from_now
    )
  end

  def register_recipients(user_ids, callback_time)
    return if user_ids.empty?

    [nil, :email].each do |tag|
      ReadRaptor::RegisterArticleWorker.new.perform(
        key: ReadRaptorSerializer.serialize_entity(Event, event.id, tag),
        recipients: user_ids,
        via: [{
          type: 'webhook',
          at: callback_time.to_i,
          url: webhooks_readraptor_immediate_url(event.id)
        }]
      )
    end
  end
end
