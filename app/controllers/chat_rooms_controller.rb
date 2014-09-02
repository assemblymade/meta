class ChatRoomsController < ApplicationController
  before_action :authenticate_user!

  def index
    respond_to do |format|
      format.html { redirect_to chat_room_path('general') }
      format.json {
        @rooms = (
          [ChatRoom.general] +
          ChatRoom.where(product_id: current_user.followed_product_ids).order(:slug)
        ).compact

        render json: {
          chat_rooms: ActiveModel::ArraySerializer.new(@rooms)
        }
      }
    end
  end

  def show
    @chat_room = ChatRoom.find_by!(slug: params[:id])
    @activity_stream = ActivityStream.new(@chat_room).page(params[:top_id])
  end
end
