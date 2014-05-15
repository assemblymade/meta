class DiscussionsController < WipsController

  def index
    params[:sort] ||= 'created'
    @upgrade_stylesheet = true
    super
  end

  def show
    @upgrade_stylesheet = true
    @threads = find_wips
    super
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

end
