class TrackActivityCreated
  include Sidekiq::Worker
  sidekiq_options queue: 'analytics'

  def perform(activity_id)
    activity = Activity.find(activity_id)
    Analytics.track(
      user_id: activity.actor_id,
      event: 'activity.v2',
      timestamp: activity.created_at,
      properties: ActivityAnalyticsSerializer.new(activity).as_json
    )
  end
end
