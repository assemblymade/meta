class MessagesController < ApplicationController

  def index
    @messages = Message.includes(:author).order(:created_at).reverse_order.limit(50)
  end

  def create
    authenticate_user!

    @message = Message.new(message_params)
    @message.author = current_user
    @message.save!

    if ENV['PUSHER_URL']
      Pusher.trigger(
        'private-chat',
        'message:created',
        MessageSerializer.new(@message).to_json
      )
    end

    redirect_to chats_path
  end

protected

  def message_params
    params.require(:message).permit(:body)
  end

end
