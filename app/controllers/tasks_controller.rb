class TasksController < WipsController
  wrap_parameters format: [:json]

  def new
    @bounty = Task.new(product: @product)
  end

  def create
    @bounty = WipFactory.create(
      @product,
      product_wips,
      current_user,
      request.remote_ip,
      wip_params,
      params[:description]
    )

    if @bounty.valid?
      if (amount = params[:offer].to_i) > 0
        @offer = @bounty.offers.create(user: current_user, amount: amount, ip: request.ip)
      end

      @bounty.watch!(current_user)

      if params[:project_id]
        project = @product.milestones.find_by!(number: params[:project_id])
        project.tasks << @bounty
      end

      @activity = Activities::Start.publish!(
        actor: current_user,
        subject: @bounty,
        target: @product,
        socket_id: params[:socket_id]
      )

      if !current_user.staff?
        AsmMetrics.product_enhancement
        AsmMetrics.active_user(current_user)
      end
    end

    respond_with @bounty, location: wip_path(@bounty)
  end

  def show
    @bounty = @wip # fixme: legacy

    @milestone = MilestoneTask.where('task_id = ?', @bounty.id).first.try(:milestone)
    if signed_in?
      @invites = Invite.where(invitor: current_user, via: @wip)
    end

    @events = Event.render_events(@bounty.events.order(:number), current_user)

    finished('long_user_survey_on_signup')

    respond_to do |format|
      format.html { render 'bounties/show' }
      format.json { render json: @bounty, serializer: WipSerializer }
    end
  end

  def index
    if params[:state].blank? && params[:project].blank?
      params[:state] = 'open'
    end

    @wips = find_wips
    @project = @product.milestones.find_by(number: params[:project]) if params[:project]
    @milestones = @product.milestones.open
    @auto_tip_contracts = @product.auto_tip_contracts.active
    @featured_bounties = @product.bounty_postings
    @selected_user = User.find_by(id: params[:user_id]) if params[:user_id].present?

    respond_to do |format|
      format.html do
        expires_now
        render 'bounties/index'
      end
      format.json { render json: @wips.map{|w| WipSearchSerializer.new(w) } }
    end
  end

  def start_work
    if username = params[:assign_to]
      assignee = User.find_by(username: username.gsub('@', '').strip())
    end

    assignee ||= current_user

    @allocation = @wip.start_work!(assignee)

    if !assignee.staff?
      AsmMetrics.product_enhancement
      AsmMetrics.active_user(assignee)
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
    @milestone = @product.milestones.find_by!(number: params[:project_id])
    @task = @milestone.tasks.find_by!(number: params[:id])
    @milestone.tasks -= [@task]

    render nothing: true, status: 200
  end

  def urgency
    authorize! :multiply, @wip
    @urgency = Urgency.find_by_slug!(params[:urgency])
    @wip.multiply!(current_user, @urgency.multiplier)
  end

  # private

  def find_wips
    # return [] unless signed_in?

    options = params.merge(partner: @product.partner?(current_user))
    query = FilterWipsQuery.call(product_wips, current_user, options)
    PaginatingDecorator.new(query)
  end

  def wip_class
    Task
  end

  def product_wips
    @product.tasks.includes(:workers, :product, :tags)
  end

  def copy_params
    params.require(:copy_deliverable).permit(:body)
  end

  def code_params
    params.require(:code_deliverable).permit(:url)
  end

  def wip_params
    params.require(:task).permit(:title, :description, tag_list: [])
  end

  def update_wip_params
    params.require(:task).permit(:title, :description)
  end
end
