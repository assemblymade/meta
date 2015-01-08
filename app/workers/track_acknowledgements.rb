class TrackAcknowledgements
  include Sidekiq::Worker
  sidekiq_options queue: 'analytics'

  EVENT_NAME = (ENV['ACK_METRIC'] || 'acknowledged')

  def perform(discussion_global_id, user_ids)
    @discussion = GlobalID::Locator.locate(discussion_global_id)

    props = DiscussionAnalyticsSerializer.new(@discussion).as_json

    user_ids.each do |user_id|
      Analytics.track(
        user_id: user_id,
        event: EVENT_NAME,
        timestamp: @discussion.created_at,
        properties: props
      )
    end
  end
end
