class LandlineBridgeWorker
  include Sidekiq::Worker

  def perform(room_slug, body, user_id)
    ChatMigrator.new.post(
      "/teams/#{ENV["LANDLINE_TEAM"]}/rooms/#{room_slug}/messages",
      { body: body, user_id: user_id }
    )
  end
end
