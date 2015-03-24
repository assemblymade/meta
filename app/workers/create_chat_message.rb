class CreateChatMessage < ApiWorker
  include Sidekiq::Worker

  def perform(user_id, room_id, body)
    @user = User.find(user_id)
    @room = ChatRoom.find(room_id)

    post api_chat_room_comments_url(@room.slug), body: body
  end
end
