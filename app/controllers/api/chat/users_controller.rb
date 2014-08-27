module Api
  module Chat
    class UsersController < ApiController
      before_action :authenticate

      def index
        @chat_room = ChatRoom.find_by!(slug: params[:chat_room_id])
        if product = @chat_room.product
          users = product.followers
        else
          users = User.all
        end

        @users = users.where('last_request_at > ?', 1.hour.ago)
        respond_with(@users)
      end
    end
  end
end
