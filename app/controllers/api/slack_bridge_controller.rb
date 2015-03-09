module Api
  class SlackBridgeController < ApiController
    before_action :verify_auth

    def receive
      # only allow messages with whitelisted subtypes

      message = params[:data][:message]
      user = params[:data][:user]
      product_slug = params[:data][:product]

      body = message[:msg_text]

      product = Product.find_by!(slug: product_slug)
      
      user = User.find_by(email: user[:email])
      user = User.find_by(username: user[:slack_handle]) if user.nil?
      user = User.find_by(name: user[:full_name]) if user.nil?
      # fall back to kernel if still not found
      render json: "error", status: 500 and return if user.nil?

      @chat_room = ChatRoom.includes(:wip).find_by!(slug: product_slug)
      @chat_room.with_lock do
        @event = Event::Comment.create(
          user: user,
          wip: @chat_room.wip,
          body: body
        )
      end

      if @event.valid?
        # process_mentioned_users(@event)

        @activity = Activities::Chat.publish!(
          actor: user,
          subject: @event,
          target: @chat_room
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
            { chat_room: @chat_room.id, updated: @event.created_at.to_i }
          )
        end
      end

      render json: params, status: :ok
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

    private

      def verify_auth
        auth = params.delete(:auth)
        payload = params[:data]

        body = payload.to_json
        timestamp = Time.now.to_i
        prehash = "#{timestamp}#{body}"
        secret = Base64.decode64(ENV['SLACKPIPE_SECRET'])
        hash = OpenSSL::HMAC.digest('sha256', secret, prehash)
        signature = Base64.encode64(hash)

        if auth.nil? || (Time.now.to_i - auth[:timestamp] > 30) || signature != auth[:signature]
          render json: {error: 'invalid auth'}, status: 401 and return
        end
      end
  end
end


