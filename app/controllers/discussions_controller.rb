class DiscussionsController < WipsController

  def index
    params[:sort] ||= 'created'

    super
  end

  def show
    if @wip.main_thread?
      redirect_to product_chat_path(@wip.product)
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

  def find_product!
    @product = Product.find_by_slug!(params[:product_id])
  end

  def find_discussion!
    @discussion = @product.wips.find_by_number(params[:id])
  end

end
