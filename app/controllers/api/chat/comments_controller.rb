module Api
  module Chat
    class CommentsController < ApplicationController
      respond_to :json

      protect_from_forgery with: :null_session, if: Proc.new { |c| c.request.format == 'application/json' }

      before_action :authenticate
      before_action :authenticate_user!

      def create
        @product = Product.find_by(slug: params[:product_id])
        @user = current_user
        @wip = Wip.find_by(id: @product.main_thread_id)

        @wip.with_lock do
          @event = Event.create_from_comment(@wip, Event::Comment, params[:message], @user)
        end

        if @event.valid?
          @event.notify_users!(@wip.watchers)

          Activities::Chat.publish!(
            actor: @user,
            subject: @event,
            target: @product.main_thread
          )
        end

        respond_with '', status: :ok, location: product_chat_path(params[:product_id])
      end

      private

      def authenticate
        authenticate_or_request_with_http_token do |token, options|
          user = User.find_by(authentication_token: token)

          sign_in user if user
        end
      end
    end
  end
end
