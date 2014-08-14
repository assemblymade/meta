class MarkChatRoomAsRead
  include Sidekiq::Worker

  def perform(user_id, product_id)
    ReadRaptorClient.new.get(
      ReadraptorTracker.new(
        ReadRaptorSerializer.serialize_entity('chat', product_id),
        user_id).url
    )
  end
end
