module Api
  module Chat
    class CommentsController < ApiController
      before_action :authenticate

      def create
        body = params[:body] || params[:message] # TODO: (whatupdave) change Kernel to use body
        @chat_room = ChatRoom.includes(:wip).find_by!(slug: params[:chat_room_id])
        @event = Event.create_from_comment(@chat_room.wip, Event::Comment, body, current_user)

        if @event.valid?
          if @chat_room.product
            @event.notify_users!(@chat_room.product.followers)
          end

          Activities::Chat.publish!(
            actor: current_user,
            subject: @event,
            target: @chat_room
          )
        end

        respond_to do |format|
          format.json { render nothing: true }
        end
      end

      def index
        @chat_room = ChatRoom.find_by!(slug: params[:chat_room_id])
        @activity_stream = ActivityStream.new(@chat_room).page(params[:top_id])
        respond_to do |format|
          format.json {
            render json: @activity_stream.map {|a| ActivitySerializer.new(a, scope: current_user)}
          }
        end
      end
    end
  end
end
