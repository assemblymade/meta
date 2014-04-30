class CommentsController < ApplicationController
  include Missions::CompletionHelper

  respond_to :html, :json

  before_action :authenticate_user!, :only => [:create]
  before_action :set_wip
  before_action :set_comment, only: [:edit, :update]

  def create
    Sequence.save_uniquely do
      case comment_params[:type]
      when 'Event::Close'
        authorize! :close, @wip
        @event = @wip.close!(current_user, comment_params[:body])
        @event_name = 'wip.closed'

      when 'Event::Reopen'
        @event = @wip.reopen!(current_user, comment_params[:body])
        @event_name = 'wip.reopened'

      when 'Event::Rejection'
        authorize! :reject, @wip
        @event = @wip.reject!(current_user, comment_params[:body])
        @event_name = 'wip.rejected'

      when 'Event::Unallocation'
        authorize! :unallocate, @wip
        @event = @wip.unallocate!(current_user, comment_params[:body])
        @event_name = 'wip.unallocated'

      when 'Event::Promote'
        authorize! :promote, @wip
        @event = @wip.promote!(current_user, comment_params[:body])
        @event_name = 'wip.promoted'

      when 'Event::Demote'
        authorize! :promote, @wip
        @event = @wip.demote!(current_user, comment_params[:body])
        @event_name = 'wip.demoted'

      when 'Event::Comment'
        @event = Event::Comment.new(comment_params.merge(user_id: current_user.id))
        @wip.events << @event
        @event_name = 'wip.commented'
        track_event 'wip.engaged', WipAnalyticsSerializer.new(@wip, scope: current_user).as_json.merge(engagement: 'commented')
        at_replied_users = @event.notify_users
        excluded_users = [@event.user, at_replied_users].flatten.compact.uniq
        ReadRaptorDelivery.new(@wip.watchers - excluded_users).deliver_async(@event)
      else
        raise 'Unknown event'
      end
    end

    track_params = EventAnalyticsSerializer.new(@event, scope: current_user).as_json
    track_event @event_name, track_params
    if !current_user.staff?
      AsmMetrics.product_enhancement
      AsmMetrics.active_user(current_user)
      AsmMetrics.active_builder(current_user)
    end
    next_mission_if_complete!(@product.current_mission, current_user)

    respond_with @event, location: product_wip_path(@product, @wip), serializer: EventSerializer
  end

  def edit
    authorize! :update, @comment
  end

  def update
    authorize! :update, @comment

    @comment.update_attributes(comment_params.merge(updated_by: current_user))

    respond_with @comment, location: url_for([@product, @wip]), serializer: EventSerializer
  end

  # private

  def set_wip
    @product = Product.find_by!(slug: params[:product_id]).decorate
    if params[:discussion_id]
      @wip = @product.discussions.find_by(number: params[:discussion_id])
    else
      @wip = @product.wips.find_by(number: params[:wip_id])
    end
  end

  def set_comment
    @comment = @wip.comments.find_by!(number: params[:id])
  end

  def comment_params
    params.require(:event_comment).permit(:body, :type)
  end
end
