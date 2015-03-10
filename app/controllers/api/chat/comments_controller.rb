module Api
  module Chat
    class CommentsController < ApiController
      before_action :authenticate

      def create
        body = params[:body] || params[:message] # TODO: (whatupdave) change Kernel to use body
        @chat_room = ChatRoom.includes(:wip).find_by!(slug: params[:chat_room_id])
        @chat_room.with_lock do
          @event = Event::Comment.create(
            user: current_user,
            wip: @chat_room.wip,
            body: body,
            socket_id: params[:socket_id]
          )
        end

        if @event.valid?
          process_mentioned_users(@event)

          @activity = Activities::Chat.publish!(
            actor: current_user,
            subject: @event,
            target: @chat_room,
            socket_id: params[:socket_id]
          )

          # push @mentions to mentionee
          (@event.mentioned_user_ids - [@event.user_id]).each do |user_id|
            PushMention.push(
              user_id,
              params[:socket_id],
              "@#{@event.user.username} mentioned you in ##{@chat_room.slug}",
              @event,
              chat_room_path(@chat_room)
            )
          end

          # push chat added to all chat followers
          channels = @chat_room.follower_ids.map{|user_id| "user.#{user_id}"}
          if channels.any?
            PusherWorker.perform_async(
              channels,
              "CHAT_ADDED",
              { chat_room: @chat_room.id, updated: @event.created_at.to_i },
              socket_id: params[:socket_id]
            )
          end

          SlackpipePayload.deploy!({
            message: {
              product: @chat_room.slug,
              text: body,
              user_handle: "#{current_user.username} (asm)",
              user_avatar: current_user.avatar.url.to_s
            }
          })
        end

        respond_to do |format|
          format.json { render json: @activity, serializer: ActivitySerializer }
        end
      end

      def index
        @chat_room = ChatRoom.find_by!(slug: params[:chat_room_id])
        @activity_stream = ActivityStream.new(@chat_room.id).page(params[:top_id])
        respond_to do |format|
          format.json {
            render json: @activity_stream.map {|a| ActivitySerializer.new(a, scope: current_user)}
          }
        end
      end

      def process_mentioned_users(event)
        props = DiscussionAnalyticsSerializer.new(@chat_room).as_json

        (event.mentioned_users - [event.user]).each do |mentioned_user|
          EmailLog.send_once mentioned_user.id, event.id do
            ChatMailer.delay(queue: 'mailer').mentioned_in_chat(mentioned_user.id, event.id)
          end

          Analytics.track(
            user_id: mentioned_user.id,
            event: 'acknowledged',
            timestamp: event.created_at,
            properties: props
          )
        end
      end

    end
  end
end
