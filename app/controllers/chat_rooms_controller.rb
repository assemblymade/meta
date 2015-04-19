class ChatRoomsController < ApplicationController
  before_action :set_product

  def index
    respond_to do |format|
      format.html { redirect_to chat_room_path('general') }
      format.json {
        @rooms = (
          [ChatRoom.general] +
          ChatRoom.where(product_id: current_user.followed_product_ids).includes(:product).order(:slug)
        ).compact

        render json: {
          chat_rooms: ActiveModel::ArraySerializer.new(@rooms, scope: current_user),
          sort_keys: current_user.recent_product_ids.try(:map) {|pid| "chat_#{pid}"} || []
        }
      }
    end
  end

  def show
    @debug = params[:debug] == 'true'
    @chat_room = ChatRoom.find_by!(slug: params[:id])

    if @product
      store_data default_users: [{id: 'core', username: 'core', name: "#{@product.name} Core Team"}]
    end

    @rooms = (
      [ChatRoom.general] +
      ChatRoom.where(product_id: current_user.followed_product_ids).includes(:product).order(updated_at: :desc)
    ).uniq.compact

    store_data activity_stream: ActivityStream.new(@chat_room.id).page(params[:top_id])
  end

  def set_product
    id = params[:product_id] || params[:id]

    if id == 'general'
      @product = Product.find_by_slug!('meta').decorate
    else
      @product = Product.find_by_slug(id).try(:decorate)
    end
  end
end
