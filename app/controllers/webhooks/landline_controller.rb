class Webhooks::LandlineController < WebhookController
  def create
    case params[:webhook_type]
    when 'message'
      message_received(params[:message])
    end

    render nothing: true, status: 200
  end

  def message_received(message)
    @user = User.find(message['user_id'])
    @room = ChatRoom.find_by!(slug: message['slug'])

    CreateChatMessage.perform_async(@user.id, @room.id, message['body'])
  end
end
