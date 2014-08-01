class Users::ChatRoomsController < ApplicationController
  before_action :authenticate_user!

  def index
    @products = Product.joins(:watchings).where('subscription = true').where('watchings.user_id = ?', current_user.id)

    render json: @products, each_serializer: ChatRoomSerializer
  end
end