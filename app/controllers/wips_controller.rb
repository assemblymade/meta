class WipsController < ProductController
  include Missions::CompletionHelper

  respond_to :html, :json

  before_filter :set_no_cache, only: [:index]
  before_action :authenticate_user!, :except => [:show, :index, :search]
  before_action :set_product
  before_action :set_wip, except: [:index, :new, :create, :search]
  before_action :validate_wip_administer , only: [:edit, :update, :destroy]
  after_action  :mark_wip_viewed, only: [:edit, :show]

  def wip_class
    raise 'override'
  end

  def product_wips
    raise 'override'
  end

  def wip_path(wip)
    product_wip_path(@product, wip)
  end

  def index
    params[:state] ||= 'open'
    @wips = find_wips

    respond_to do |format|
      format.html { expires_now }
      format.json { render json: @wips.map{|w| WipSearchSerializer.new(w) } }
    end
  end

  def show
    @watchers = @wip.watchers.to_a

    @events = Event.render_events(@wip.events.order(:number), current_user)

    respond_to do |format|
      format.html
      format.json { render json: @wip, serializer: WipSerializer }
    end
  end

  def new
    @wip = wip_class.new(product: @product)
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
      if milestone_number = params[:milestone_id]
        @milestone = @product.milestones.find_by!(number: milestone_number)
        MilestoneTask.find_or_create_by!(milestone: @milestone, task: @wip)
      end

      Vote.clear_cache(current_user, @wip)
      next_mission_if_complete!(@product.current_mission, current_user)
      @activity = Activities::Start.publish!(
        actor: current_user,
        subject: @wip,
        target: @product,
        socket_id: params[:socket_id]
      )

      track_params = WipAnalyticsSerializer.new(@wip, scope: current_user).as_json.merge(engagement: 'created')
      track_event 'wip.engaged', track_params
      if !current_user.staff?
        AsmMetrics.product_enhancement
        AsmMetrics.active_user(current_user)
      end
    end

    respond_with @wip, location: wip_path(@wip)
  end

  def update
    if title = wip_params[:title]
      @wip.update_title! current_user, title unless title == @wip.title
    end

    apply_tag()

    @wip.update_attributes(update_wip_params)

    respond_with @wip, location: wip_path(@wip)
  end

  def apply_tags
    if tag_list = wip_params[:tag_list]
      @wip.update_tag_names! current_user, tag_list
    end

    @wip.update_attributes(update_wip_params)
  end

  def tag
    apply_tags()

    respond_with @wip, location: wip_path(@wip)
  end

  def checkin
    @worker = Wip::Worker.where(user_id: current_user.id, wip_id: @wip.id).first
    @worker.checked_in! if @worker
    redirect_to url_for([@wip.product, @wip])
  end

  def stop_work
    user = User.find_by(username: params[:user])
    @wip.stop_work!(user || current_user)
    respond_with @wip, location: product_wip_path(@product, @wip)
  end

  def review
    @wip.review_me!(current_user)
    respond_with @wip, location: product_wip_path(@product, @wip)
  end

  def reject
    @wip.reject!(current_user)
    respond_with @wip, location: product_wip_path(@product, @wip)
  end

  def unallocate
    @wip.unallocate!(current_user)
    respond_with @wip, location: product_wip_path(@product, @wip)
  end

  def award
    if winner_id = params.fetch(:event_id)
      authorize! :award, @wip
      @event = Event.find(winner_id)
      @wip.award! current_user, @event
      if @product.tasks.won_by(@event.user).count == 1
        BadgeMailer.delay(queue: 'mailer').first_win(@event.id)
      end
      track_wip_event 'awarded'
    end
    redirect_to product_wip_path(@wip.product, @wip)
  end

  def search
    query, product_id = params[:query], params[:product_id]
    @results = Wip.search do
      query do
        fuzzy 'title', query
      end
      filter :term, product: product_id
    end
    render json: @results
  end

  def watch
    @wip.watch!(current_user)
    respond_with @wip, location: request.referer
  end

  private

  def validate_wip_administer
    head(:forbidden) unless can? :update, @wip
  end

  def mark_wip_viewed
    @wip.updates.for(current_user).viewed! if signed_in?
  end

  def find_wips
    query = FilterWipsQuery.call(product_wips, current_user, params)
    PaginatingDecorator.new(query)
  end

  def track_wip_event(name)
    track_event "wip.#{name}", WipAnalyticsSerializer.new(@wip, scope: current_user).as_json
  end

  def set_wip
    number = params[:wip_id] || params[:task_id] || params[:id]
    if number.to_i.zero?
      @wip = @product.main_thread.decorate
    else
      @wip = @product.wips.find_by!(number: number).decorate
    end
    @events = @wip.events.order(:number)

    # special case redirect to milestones
    if @wip.type.nil?
      redirect_to product_milestone_path(@product, @wip)
    elsif @wip.type != wip_class.to_s
      redirect_to url_for([@product, @wip])
    end
  end
end
