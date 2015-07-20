class TasksController < WipsController
  wrap_parameters format: [:json]

  after_filter -> { current_user.update(coin_callout_viewed_at: Time.now) if current_user },
    only: :index

  def index
    redirect_to "https://assembly.com/#{params[:product_id]}"
  end

  def new
    redirect_to "https://assembly.com/#{params[:product_id]}"
  end

  def show
    redirect_to "https://assembly.com/#{params[:product_id]}"
  end

  def assign
    asignee = current_user
    if user_id = params[:assign_to_user_id]
      if user_id != current_user.id
        authorize! :update, @product
      end
      assignee = User.find(user_id)
    end

    @allocation = @wip.start_work!(assignee)
    respond_with @wip, location: product_wip_path(@product, @wip)
  end

  def lock
    @wip.lock_bounty!(current_user) if can? :update, @wip

    respond_to do |format|
      format.json { render json: @wip }
    end
  end

  def destroy
    # This removes a task from a milestone. Doesn't delete the actual Task
    @milestone = @product.milestones.find_by!(number: params[:project_id])
    @task = @milestone.tasks.find_by!(number: params[:id])
    @milestone.tasks -= [@task]

    render nothing: true, status: 200
  end

  # private

  def find_wips
    FilterWipsQuery.call(product_wips, current_user, params.symbolize_keys).includes(:news_feed_item)
  end

  def wip_class
    Task
  end

  def product_wips
    @product.tasks.includes(:workers, :product, :tags)
  end

  def wip_params
    params.require(:task).permit(:title, :description, tag_list: [])
  end

  def update_wip_params
    params.require(:task).permit(:title, :description, :priority, :priority_above_id, :priority_below_id)
  end
end
