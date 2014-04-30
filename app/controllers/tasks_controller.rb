class TasksController < WipsController

  def show
    @milestone = MilestoneTask.where('task_id = ?', @wip.id).first.try(:milestone)
    super
  end

  def start_work
    @wip.start_work!(current_user)
    track_event 'wip.engaged', WipAnalyticsSerializer.new(@wip, scope: current_user).as_json.merge(engagement:'started_work')
    if !current_user.staff?
      AsmMetrics.product_enhancement
      AsmMetrics.active_user(current_user)
    end
    respond_with @wip, location: product_wip_path(@product, @wip)
  end

  def deliverables
    @attachment = Attachment.find(params[:attachment_id])
    @wip.submit_design! @attachment, current_user
    AsmMetrics.active_user(current_user) unless current_user.staff?
    respond_with @wip, location: product_wip_path(@product, @wip)
  end

  def copy_deliverables
    @wip.submit_copy! copy_params, current_user
    AsmMetrics.active_user(current_user) unless current_user.staff?
    respond_with @wip, location: product_wip_path(@product, @wip)
  end

  def code_deliverables
    deliverable = @wip.submit_code! code_params, current_user
    AsmMetrics.active_user(current_user) unless current_user.staff?
    respond_with deliverable, location: product_wip_path(@wip.product, @wip)
  end

  def destroy
    # This removes a task from a milestone. Doesn't delete the actual Task
    @milestone = @product.milestones.find_by!(number: params[:milestone_id])
    @task = @milestone.tasks.find_by!(number: params[:id])
    @milestone.tasks -= [@task]

    render nothing: true, status: 200
  end

  def wip_class
    Task
  end

  def product_wips
    @product.tasks
  end

  def copy_params
    params.require(:copy_deliverable).permit(:body)
  end

  def code_params
    params.require(:code_deliverable).permit(:url)
  end

  def wip_params
    params.require(:task).permit(:title, :deliverable)
  end

  def update_wip_params
    params.require(:task).permit(:title, :deliverable)
  end

  def to_discussion
    authorize! :update, @wip
    @wip.move_to!(Discussion, current_user)
    respond_with @wip, location: product_discussion_path(@product, @wip)
  end
end
