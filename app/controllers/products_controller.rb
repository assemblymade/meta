class ProductsController < ProductController
  respond_to :html, :json

  before_action :authenticate_user!, only: [:create, :edit, :update]
  before_action :set_product,
    only: [:show, :edit, :update, :follow, :metrics, :flag, :feature]

  def new
    @product = Product.new
    @product.user = current_user

    @four_word_story_example = [
        'Organize everything you love.',
        'Easily find useful information.'
      ].sample

    render layout: 'application'
  end

  def create
    @product = current_user.products.create(product_params)
    if @product.valid?
      if !current_user.staff?
        track_event 'product.created', ProductAnalyticsSerializer.new(@product).as_json
        AsmMetrics.active_user(current_user)
      end

      @product.core_team << current_user
      @product.watch!(current_user)
      @product.upvote!(current_user, request.remote_ip)
      TransactionLogEntry.validated!(Time.current, @product, @product.id, @product.user.id, @product.user.id)
      @product.update_attributes main_thread: @product.discussions.create!(title: Discussion::MAIN_TITLE, user: current_user, number: 0)

      Activities::FoundProduct.publish!(
        target: @product,
        subject: @product,
        actor: current_user
      )

      schedule_greet
      schedule_one_hour_checkin
      schedule_one_day_checkin

      flash[:new_product_callout] = true
    end
    respond_with(@product, location: product_path(@product))
  end

  def flag
    return redirect_to(product_url(@product)) unless current_user && current_user.is_staff?
    if request.post?
      @product.touch(:flagged_at)
      @product.update_attribute(:flagged_reason, params[:message])
      # TODO: disabling email to idea submitter for time being
      # ProductMailer.delay(queue: 'mailer').flagged(current_user.id, @product.id, params[:message])
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

  def follow
    @product.watch!(current_user)
    render nothing: true, :status => :ok
  end

  def subscribe
    authenticate_user!
    set_product
    @product.watch!(current_user)
    respond_with @product, location: product_wips_path(@product)
  end

  def unsubscribe
    authenticate_user!
    set_product
    @product.unwatch!(current_user)
    respond_with @product, location: product_wips_path(@product)
  end

  def metrics
    raise 'Mixpanel not configured in ENV' if ENV['MIXPANEL_API_KEY'].blank? || ENV['MIXPANEL_API_SECRET'].blank? || ENV['MIXPANEL_CONVERSION_FUNNEL_ID'].blank?
    @user_metrics = UserMetricsExpanded.new(@product)
  end

  def generate_name
    render json: { name: NameGenerator.generate_unique }
  end

  def schedule_greet
    message = "Pfft. What's #{@product.name}? There's nothing here. Better get to work!"
    PostChatMessage.perform_in(30.seconds, @product.slug, message)
  end

  def schedule_one_hour_checkin
    eligible_products = Product.public_products.where('votes_count >= ?', 10)
    index = rand(eligible_products.count)
    example_product = eligible_products[index]

    message = "Whoa whoa whoa. You still haven't done anything? You're killin' me, Smalls. Why not take a look at [#{example_product.name}](#{product_path(example_product)}) for some inspiration?"
    PostChatMessage.perform_in(1.hour, @product.slug, message)
  end

  def schedule_one_day_checkin
    message = "I'm gonna have to do this for you, aren't I? Is anyone even here?"

    # TODO: Create a project with a TodoList and push that to chat

    PostChatMessage.perform_in(1.day, @product.slug, message)
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
