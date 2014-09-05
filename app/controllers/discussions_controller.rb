class DiscussionsController < WipsController

  def index
    params[:sort] ||= 'created'

    super
  end

  def create
    @wip = WipFactory.create(
      @product,
      product_wips,
      current_user,
      request.remote_ip,
      wip_params,
      params[:description]
    )

    if @wip.valid?
      if milestone_number = params[:project_id]
        @milestone = @product.milestones.find_by!(number: milestone_number)
        MilestoneTask.find_or_create_by!(milestone: @milestone, task: @wip)
      end

      @activity = Activities::Start.publish!(
        actor: current_user,
        subject: @wip,
        target: @product,
        socket_id: params[:socket_id]
      )

      track_params = WipAnalyticsSerializer.new(@wip, scope: current_user).as_json.merge(engagement: 'created')
      if !current_user.staff?
        AsmMetrics.product_enhancement
        AsmMetrics.active_user(current_user)
      end
    end

    respond_with @wip, location: wip_path(@wip)
  end


  def show
    if @wip.main_thread?
      redirect_to chat_room_path(@wip.product.main_chat_room)
      return
    end

    super
  end

  def close
    authenticate_user!
    find_product!
    find_discussion!
    authorize! :update, @discussion
    @discussion.close!(current_user)
    respond_with(@discussion,
      location: product_discussion_path(@discussion.product, @discussion)
    )
  end

  def wip_class
    Discussion
  end

  def product_wips
    @product.discussions.where('wips.number > 0')
  end

  def wip_params
    params.require(:discussion).permit(:title)
  end

  def update_wip_params
    params.require(:discussion).permit(:title)
  end

  def wip_path(wip)
    product_discussion_path(@product, wip)
  end

  def to_task
    authorize! :update, @wip
    @wip.move_to!(Task, current_user)
    respond_with @wip, location: product_wip_path(@wip.product, @wip)
  end

  protected

  def find_discussion!
    @discussion = @product.wips.find_by_number(params[:id])
  end

end
