class TrackActivityCreated
  include Sidekiq::Worker
  sidekiq_options queue: 'analytics'

  def perform(activity_id)
    activity = Activity.find(activity_id)

    return if !activity.track_analytics?

    if activity.engagement?
      TrackEngaged.perform_async(activity.actor_id, activity.created_at, activity.verb)
    else
      Analytics.track(
        user_id: activity.actor_id,
        event: TrackInfluenced::EVENT_NAME,
        timestamp: activity.created_at,
        properties: ActivityAnalyticsSerializer.new(activity).as_json
      )
    end
  end
end
