class DiscussionsController < WipsController

  def index
    redirect_to product_posts_path(@product)

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

      @activity = Activities::Post.publish!(
        actor: current_user,
        subject: @wip,
        target: @product,
        socket_id: params[:socket_id]
      )

      track_params = WipAnalyticsSerializer.new(@wip, scope: current_user).as_json.merge(engagement: 'created')
    end

    respond_with @wip, location: wip_path(@wip)
  end


  def show
    if @wip.main_thread?
      redirect_to chat_room_path(@wip.product.main_chat_room)
      return
    end

    if room = @product.chat_rooms.find{|cr| cr.wip == @wip }
      redirect_to chat_room_path(room)
    end

    # TODO: (whatupdave) find a post with the same title, these discussions are old but the links
    # are still around
    redirect_to product_post_path(@product, Post.find_by!(product_id: @product.id, title: @wip.title))
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

  protected

  def find_discussion!
    @discussion = @product.wips.find_by_number(params[:id])
  end

end
