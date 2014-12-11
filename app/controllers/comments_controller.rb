class CommentsController < ProductController
  respond_to :html, :json

  before_action :authenticate_user!, :only => [:create]
  before_action :set_wip
  before_action :set_event, only: [:show, :edit, :update]

  def show
    respond_with @comment, location: product_wip_path(@product, @wip), serializer: EventSerializer
  end

  def create
    type = comment_params[:type].constantize
    body = comment_params[:body]

    authorize! type.slug.to_sym, @wip

    @wip.with_lock do
      @event = Event.create_from_comment(
        @wip,
        type,
        body,
        current_user,
        comment_params[:socket_id],
        comment_params[:attachments]
      )
    end

    if @event.valid?
      if type == Event::Comment
        RegisterEventInReadraptor.perform_async(@event.to_global_id.to_s)

        @event.auto_watch!(current_user)
        @event.update_pusher

        Activities::Comment.publish!(
          actor: @event.user,
          subject: @event,
          target: @wip,
          socket_id: params[:socket_id]
        )

        NewsFeedItemComment.publish_to_news_feed(@wip, @event, body)

        @event.reload

        # update @wip.locked_at if the commenting user was working on it
        if @wip.locked_by == @event.user.id
          @wip.update(locked_at: Time.now)
        end

        @product.auto_watch!(current_user)
      end

      track_analytics(@event)
    end

    respond_with @event, location: product_wip_path(@product, @wip), serializer: EventSerializer
  end

  def edit
    authenticate_user!
    authorize! :update, @comment
  end

  def update
    authenticate_user!
    authorize! :update, @comment

    @comment.update(comment_params.merge(updated_by: current_user))

    respond_with @comment, location: url_for([@product, @wip]), serializer: EventSerializer
  end

  # private

  def set_wip
    find_product!

    if params[:discussion_id]
      @wip = @product.discussions.find_by(number: params[:discussion_id])
    else
      @wip = @product.wips.find_by(number: params[:wip_id])
    end
  end

  def set_event
    @comment = params[:id].uuid? ? @wip.events.find(params[:id]) : @wip.events.find_by(number: params[:id])
  end

  def comment_params
    params.require(:event_comment).permit(:body, :type, :socket_id, :attachments => [])
  end

  def track_analytics(event)
    track_params = EventAnalyticsSerializer.new(event, scope: current_user).as_json
    track_event event.class.analytics_name, track_params
    if !current_user.staff?
      AsmMetrics.product_enhancement
      AsmMetrics.active_user(current_user)
      AsmMetrics.active_builder(current_user)
    end
  end
end
