class Webhooks::PusherController < WebhookController

  def auth
    if signed_in?
      pusher = Pusher[params[:channel_name]]
      response = pusher.authenticate(params[:socket_id],
        user_id: current_user.id,
        user_info: UserSerializer.new(current_user)
      )
      render json: response
    else
      render nothing: true, status: :forbidden
    end
  end

end
