class WipsController < ProductController
  respond_to :html, :json

  before_filter :set_no_cache, only: [:index, :show]
  before_action :authenticate_user!, :except => [:show, :index, :search]
  before_action :set_product
  before_action :set_stories, except: [:index, :new, :create, :search, :mute, :watch]
  before_action :validate_wip_administer , only: [:edit, :update, :destroy]

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

  def new
    @wip = wip_class.new(product: @product)
  end

  def update
    UpdatesWip.update(@wip, update_wip_params, current_user)
    respond_with @wip.product, @wip
  end

  def apply_tags
    if tag_list = wip_params[:tag_list]
      tag_list.each do |t|
        MakeMarks.new.mark_with_name(@wip, t)
        end
      @wip.update_tag_names! current_user, tag_list
    end
  end

  def tag
    apply_tags

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
      @event = Event.find(winner_id) rescue NewsFeedItemComment.find(winner_id)

      @wip.award! current_user, @event

      if params[:close]
        @wip.close! current_user
      end

      if @product.tasks.won_by(@event.user).count == 1
        BadgeMailer.delay(queue: 'mailer').first_win(@event.id)
      end
      TrackVested.perform_async(@event.user_id, @product.id, Time.now)
    end
    redirect_to product_wip_path(@wip.product, @wip)

    Karma::Kalkulate.new.karma_from_bounty_completion(@wip, current_user.id)
    Karma::Kalkulate.new.karma_from_bounty_creation_after_completion(@wip)
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
    set_wip
    @wip.watch!(current_user)
    respond_with @wip, location: request.referer
  end

  def mute
    set_wip
    @wip.unfollow!(current_user)
    respond_to do |format|
      format.html { redirect_to product_wip_path(@product, @wip) }
      format.json { render json: @wip }
    end
  end

  def flag
    set_wip
    @wip.flag!(current_user)
    respond_with @wip, location: product_wip_path(@product, @wip)
  end

  def unflag
    set_wip
    @wip.unflag!
    respond_with @wip, location: product_wip_path(@product, @wip)
  end

  def close
    set_wip
    @wip.close!(current_user)
    respond_with @wip
  end

  def reopen
    set_wip
    @wip.reopen!(current_user, nil)
    respond_with @wip
  end

  private

  def validate_wip_administer
    head(:forbidden) unless can? :update, @wip
  end

  def find_wips
    query = FilterWipsQuery.call(product_wips, current_user, params)
    PaginatingDecorator.new(query)
  end

  def set_wip_with_redirect
    set_wip

    # special case redirect to milestones
    if @wip.type.nil?
      redirect_to product_project_path(@product, @wip)
    elsif @wip.type != wip_class.to_s
      redirect_to url_for([@product, @wip])
    end
  end

  def set_wip
    number = params[:wip_id] || params[:task_id] || params[:id]
    if number.to_i.zero?
      @wip = @product.main_thread
    else
      @wip = @product.wips.find_by!(number: number)
    end
    store_data(wip: @wip)
    @events = @wip.events.includes(:tips).order(:number)

    if nfi = @wip.news_feed_item
      @heartables = ([nfi] + nfi.comments).to_a
      store_data heartables: @heartables
      if signed_in?
        store_data user_hearts: Heart.where(user_id: current_user.id).where(heartable_id: @heartables.map(&:id))
      end
    end
  end

  def set_stories
    set_wip_with_redirect

    @stories_to_mark_as_read = Story.associated_with(@wip)
  end
end
