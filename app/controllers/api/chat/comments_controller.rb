module Api
  module Chat
    class CommentsController < ApplicationController
      respond_to :json

      protect_from_forgery with: :null_session, if: Proc.new { |c| c.request.format == 'application/json' }

      def create
        @product = Product.find_by(slug: params[:product_id])
        @user = User.find_by(username: 'kernel')
        @wip = Wip.find_by(id: @product.main_thread_id)

        @wip.with_lock do
          @event = Event.create_from_comment(@wip, Event::Comment, params[:body], @user)
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
    end
  end
end
