class Users::ChatRoomsController < ApplicationController
  before_action :authenticate_user!

  def index
    @products = current_user.followed_products

    render json: {
      chat_rooms: ActiveModel::ArraySerializer.new(@products, each_serializer: ChatRoomSerializer),
      sort_keys: current_user.recent_product_ids.try(:map) {|pid| "chat_#{pid}"} || []
    }
  end
end
