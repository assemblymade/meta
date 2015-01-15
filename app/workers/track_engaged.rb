class TrackEngaged
  include Sidekiq::Worker
  sidekiq_options queue: 'analytics'

  EVENT_NAME = (ENV['METRIC_ENGAGED'] || 'engaged')

  def perform(user_id, timestamp, engagement)
    user = User.find(user_id)

    Analytics.track(
      user_id: user.id,
      event: EVENT_NAME,
      timestamp: Time.parse(timestamp),
      properties: {
        engagement: engagement
      }
    )
  end

end
