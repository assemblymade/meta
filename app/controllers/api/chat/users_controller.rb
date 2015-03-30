module Api
  module Chat
    class UsersController < Api::ApiController
      before_action :authenticate

      def index
        @chat_room = ChatRoom.find_by!(slug: params[:chat_room_id])
        if product = @chat_room.product
          users = product.followers
        else
          users = User.all
        end

        @users = users.
          where('last_request_at > ?', 7.days.ago).
          order(last_request_at: :desc).
          limit(100)
        respond_with(@users)
      end
    end
  end
end
