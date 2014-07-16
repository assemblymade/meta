class ProductsController < ProductController
  respond_to :html, :json

  before_action :authenticate_user!, only: [:new, :create, :edit, :update]
  before_action :set_product,
    only: [:show, :edit, :update, :follow, :metrics, :flag, :feature, :launch]

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
    @product = create_product_with_params
    if @product.valid?
      respond_with(@product, location: product_welcome_path(@product))
    else
      render action: :new, layout: 'application'
    end
  end

  def welcome
    find_product!
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
    if @product.stealth? && @product.draft?
      redirect_to edit_product_path(@product)
      return
    end

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
    @product.update_attributes!(product_params)
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

  def launch
    authorize! :update, @product
    if @product.launched_at.nil?
      @product.update_attributes launched_at: Time.current
      Activities::Launch.publish!(
        target: @product,
        subject: @product,
        actor: current_user
      )
    end
    respond_with @product, location: product_path(@product)
  end

  # private

  def create_product_with_params
    product = current_user.products.create(product_params)
    if product.valid?
      if !current_user.staff?
        track_event 'product.created', ProductAnalyticsSerializer.new(product).as_json
        AsmMetrics.active_user(current_user)
      end

      product.team_memberships.create!(user: current_user, is_core: true)

      product.watch!(current_user)
      product.upvote!(current_user, request.remote_ip)
      product.update_attributes main_thread: product.discussions.create!(title: Discussion::MAIN_TITLE, user: current_user, number: 0)

      ownership = params[:ownership] || {}
      core_team_ids = Array(params[:core_team])

      core_team_members = User.where(id: core_team_ids.select(&:uuid?))

      core_team_members.each do |user|
        product.core_team_memberships.create(user: user)
      end

      coins_allocated = ownership.values.map(&:to_i).sum
      founder_coins = (100 - coins_allocated) * Product::INITIAL_COINS

      TransactionLogEntry.minted!(nil, Time.now, product, product, current_user.id, founder_coins)

      AutoTipContract.replace_contracts_with_default_core_team_split(product)

      invitees = core_team_ids + ownership.keys
      invitees.each do |email_or_user_id|
        invite_params = {
          invitor: current_user,
          via: product,
          tip_cents: (ownership[email_or_user_id].to_i || 0) * Product::INITIAL_COINS,
          core_team: true
        }

        if email_or_user_id.uuid?
          invite_params[:invitee] = User.find(email_or_user_id)
        else
          invite_params[:invitee_email] = email_or_user_id
        end
        Invite.create_and_send(invite_params)
      end

      Activities::FoundProduct.publish!(
        target: product,
        subject: product,
        actor: current_user
      )

      flash[:new_product_callout] = true

      Github::CreateProductRepoWorker.perform_async(
        product.id,
        product_url(product),
        product.slug
      )
    end
    product
  end

  def product_params
    fields = [
      :name,
      :pitch,
      :lead,
      :description,
      :tags_string,
      :poster,
      :homepage_url,
      :you_tube_video_url,
      :terms_of_service
    ] + Product::INFO_FIELDS.map(&:to_sym)

    params.require(:product).permit(*fields)
  end
end
