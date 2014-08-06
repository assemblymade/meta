class ChatController < ProductController
  before_filter :set_no_cache, only: [:index]
  respond_to :html, :json

  def index
    find_product!
    @activity_stream = ActivityStream.new(@product).page(params[:top_id])
    @activity_stream.each do |a|
      a.subject.readraptor_tag = :chat if a.subject.try(:readraptor_tag)
    end

    respond_to do |format|
      format.html do
        @recently_active = @product.watchers.where('last_request_at > ?', 9.days.ago).order(last_request_at: :desc)
        if signed_in?
          MarkAllChatAsRead.perform_async(current_user.id, @product.id)
        end
      end
      format.json do
        render json: @activity_stream.map {|a| ActivitySerializer.new(a, scope: current_user)}
      end
    end
  end

  def create
    find_product!
    authenticate_user!

    @product.main_thread.with_lock do
      @event = Event.create_from_comment(
        @product.main_thread,
        Event::Comment,
        params.fetch(:body),
        current_user
      )
    end

    if @event.valid?
      update_readraptor
      @event.notify_users!(@product.watchers)

      @activity = Activities::Chat.publish!(
        actor: @event.user,
        subject: @event,
        target: @product.main_thread,
        socket_id: params[:socket_id]
      )

      track_analytics(@event)
      next_mission_if_complete!(@product.current_mission, current_user)
    end

    respond_with @activity, location: product_chat_path(@product), serializer: ActivitySerializer
  end

  private

  def comment_params
    params.require(:comment).permit(:body)
  end

  # --

  include Missions::CompletionHelper

  def track_analytics(event)
    track_params = EventAnalyticsSerializer.new(event, scope: current_user).as_json
    track_event event.class.analytics_name, track_params
    if !current_user.staff?
      AsmMetrics.product_enhancement
      AsmMetrics.active_user(current_user)
      AsmMetrics.active_builder(current_user)
    end
  end

  def update_readraptor
    ReadRaptor::RegisterArticleWorker.perform_async(
      key: ReadRaptorSerializer.serialize_entity('chat', @product.id),
      recipients: @product.chat_watcher_ids
    )
  end
end
