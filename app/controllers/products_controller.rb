class ProductsController < ApplicationController
  respond_to :html, :json

  before_action :authenticate_user!, only: [:create, :edit, :update]
  before_action :set_product,
    only: [:show, :edit, :update, :leaderboard, :follow, :status, :readme, :metrics, :subscribe, :unsubscribe, :flag, :feature, :welcome]

  def new
    @product = Product.new
    @product.user = current_user

    @four_word_story_example = [
        'Organize everything you love.',
        'Easily find useful information.'
      ].sample

    @upgrade_stylesheet = true
  end

  def welcome
    redirect_to(product_url(@product)) if current_user
  end

  def create
    @product = current_user.products.create(product_params)
    if !current_user.staff?
      track_event 'product.created', ProductAnalyticsSerializer.new(@product).as_json
      AsmMetrics.active_user(current_user)
    end
    categories = {
                  "Engineering" => "Architects, develops, and maintains software systems. Loves text editors, command lines and making products work.",
                  "Front-end Development" => "Represents the intersection of Design and Engineering. Often works in HTML, CSS & Javascript implementing design and makeing it work with the system.",
                  "Design" => "Blends communication, stylizing, and problem-solving through the use of type, space, and image. Loves pushing pixels, creating mockups and sweating the details of user interaction."
                 }
    categories.each do |category, description|
      if @product.product_jobs.where(:category => category).blank?
        ProductJob.create(:product_id => @product.id, :user_id => current_user.id, :category => category, :description => description)
      else
      end
    end

    Watching.watch!(current_user, @product)
    @product.votes.create(user: current_user, ip: request.remote_ip)

    flash[:new_product_callout] = true
    respond_with(@product, location: product_path(@product))
  end

  def flag
    return redirect_to(product_url(@product)) unless current_user && current_user.is_staff?
    if request.post?
      @product.touch(:flagged_at)
      @product.update_attribute(:flagged_reason, params[:message])
      # TODO: disabling email to idea submitter for time being
      # ProductMailer.delay.flagged(current_user.id, @product.id, params[:message])
      return redirect_to product_url(@product)
    end
  end

  def feature
    return head(:forbidden) unless current_user && current_user.is_staff?
    @product.touch(:featured_on)
    return redirect_to product_url(@product)
  end

  def show
    @perks = @product.perks.includes(:preorders).order(:amount).decorate
    @user_metrics = UserMetricsSummary.new(@product, Date.today - 1.day)

    page_views = TimedSet.new($redis, "#{@product.id}:show")

    if page_views.add(request.remote_ip)
      Product.increment_counter(:view_count, @product.id)
      page_views.drop_older_than(5.minutes)
    end

    respond_to do |format|
      format.html { render }
      format.json { render json: @product }
    end
  end

  def edit
    authorize! :update, @product
    @upgrade_stylesheet = true
  end

  def update
    authorize! :update, @product
    @product.update_attributes(product_params)
    respond_with(@product)
  end

  def jobs
    @product_jobs = ProductJob.find(:all)
  end

  def follow
    @product.watch!(current_user)
    render nothing: true, :status => :ok
  end

  def subscribe
    @product.subscribers << current_user
    respond_with @product, location: product_wips_path
  end

  def unsubscribe
    @product.subscribers -= [current_user]
    respond_with @product, location: product_wips_path
  end

  def metrics
    raise 'Mixpanel not configured in ENV' if ENV['MIXPANEL_API_KEY'].blank? || ENV['MIXPANEL_API_SECRET'].blank? || ENV['MIXPANEL_CONVERSION_FUNNEL_ID'].blank?
    @user_metrics = UserMetricsExpanded.new(@product)
  end

  def generate_name
    render json: { name: NameGenerator.generate_unique }
  end

  # private

  def product_params
    params.require(:product).permit(
      :name,
      :pitch,
      :lead,
      :description,
      :tags_string,
      :poster,
      :homepage_url,
      :you_tube_video_url
    )
  end
end
