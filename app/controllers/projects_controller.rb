class ProjectsController < ProductController
  respond_to :html

  before_action :find_product!

  def index
    @upgrade_stylesheet = true
    @milestones = case params[:filter]
      when 'closed'
        @product.milestones.closed
      else
        @product.milestones.open
      end
  end

  def new
    authenticate_user!
    @wip = @product.wips.new
    @wip.milestone = @product.milestones.new
  end

  def show
    @upgrade_stylesheet = true
    set_milestone
    @assets = Deliverable.where(wip_id: @milestone.task_ids).includes(:attachment, :wip)
    @events = Event.render_events(@wip.events.order(:number), current_user)
    @product_balance = 0
    if signed_in?
      @product_balance = TransactionLogEntry.balance(@product, current_user.id)
    end
  end

  def edit
    set_milestone
    authorize! :update, @wip
  end

  def create
    authenticate_user!

    # first create wip
    @wip = @product.wips.create!(title: milestone_params[:title], user: current_user)

    if @wip.valid?
      # then create milestone
      @milestone = @wip.create_milestone!(milestone_params[:milestone_attributes].merge(user: current_user, product: @product))

      if @milestone.valid?
        update_tasks_for(@milestone)
      end
    end

    respond_with @wip, location: product_wips_path(@product, bounty: @milestone.number)
  end

  def update
    set_milestone
    authorize! :update, @wip

    # update wip
    if @wip.update(title: milestone_params[:title])
      # update milestone
      @milestone.update_attributes(milestone_params[:milestone_attributes])
      if @milestone.valid?
        update_tasks_for(@milestone)
      end
    end

    respond_with @wip, location: product_wips_path(@product, project: @milestone.number)
  end

  def images
    set_milestone

    attrs = image_params[:milestone_images_attributes].map do |attributes|
      attributes.merge!(user_id: current_user.id)
    end
    @milestone.update_attributes(milestone_images_attributes: attrs)

    respond_with @wip, location: product_project_path(@product, @milestone)
  end

  def add
    set_milestone

    task = if params[:task_id]
      @product.tasks.find(params[:task_id])
    else
      @product.tasks.find_by!(number: params[:id])
    end

    MilestoneTask.find_or_create_by!(milestone: @milestone, task: task)

    respond_to do |format|
      format.js { render layout: false }
    end
  end

  # private

  def set_milestone
    @milestone = @product.milestones.find_by!(number: (params[:project_id] || params[:id]))
    @wip = @milestone.wip
  end

  def milestone_params
    params.require(:wip).permit(:title, milestone_attributes: [:description], milestone_tasks_attributes: [:id, :title], milestone_images_attributes: [:attachment_id])
  end

  def image_params
    params.require(:wip).permit(milestone_images_attributes: [:attachment_id])
  end

  def update_tasks_for(milestone)
    # add/create tasks
    Array(milestone_params[:milestone_tasks_attributes]).each do |attrs|
      if attrs[:id].present?
        task = @product.tasks.find(attrs[:id])
        MilestoneTask.find_or_create_by!(milestone: @milestone, task: task)
      else
        task = WipFactory.create(
          @product,
          @product.tasks,
          current_user,
          request.remote_ip,
          title: attrs[:title]
        )
        milestone.tasks << task
      end
    end
  end
end
