require 'timed_set'

class ProductsController < ProductController
  respond_to :html, :json

  before_action :authenticate_user!, only: [:new, :create, :edit, :update, :follow, :unfollow, :announcements, :welcome]
  before_action :set_product,
    only: [:show, :old, :edit, :update, :follow, :announcements, :unfollow, :metrics, :flag, :feature, :launch]

  MARK_DISPLAY_LIMIT =  14 #maximum number of marks to display on product page
  PRODUCT_MARK_DISPLAY_LIMIT = 6

  def new
    @product = Product.new
    @product.user = current_user

    @four_word_story_example = [
        'Organize everything you love.',
        'Easily find useful information.'
      ].sample

    render layout: 'application'
  end

  def start
    @profit = ProfitReport.all.map(&:profit).sum.round(-6)
    render layout: 'application'
  end

  def create
    @product = create_product_with_params
    if @product.valid?
      respond_with(@product, location: product_welcome_path(@product))

      Karma::Kalkulate.new.award_for_product_to_stealth(@product)

      @product.retrieve_key_pair
      schedule_greet
      schedule_one_hour_checkin
      schedule_one_day_checkin
    else
      render action: :new, layout: 'application'
    end
  end

  def welcome
    find_product!
    authorize! :update, @product
  end

  def admin
    return redirect_to(product_url(@product)) unless current_user && current_user.is_staff?
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
    return redirect_to(about_url) if @product.meta?
    @user_metrics = UserMetricsSummary.new(@product, Date.today - 1.day)

    page_views = TimedSet.new($redis, "#{@product.id}:show")

    if page_views.add(request.remote_ip)
      Product.increment_counter(:view_count, @product.id)
      page_views.drop_older_than(5.minutes)
    end

    if signed_in? && current_user.staff?

      @top_wip_tags = Marks::MarkBasics.new.leading_marks_on_product(@product, MARK_DISPLAY_LIMIT)
      @product_marks = @product.marks.pluck(:name).uniq
      if @product_marks.count > PRODUCT_MARK_DISPLAY_LIMIT
        @product_marks = @product_marks[0, PRODUCT_MARK_DISPLAY_LIMIT]
      end

      if params[:filter].present?
        @mark_name = params[:filter]
        @news_feed_to_show = Marks::MarkBasics.new.news_feed_items_per_product_per_mark(@product, @mark_name).order(updated_at: :desc)
      else
        @news_feed_to_show = @product.news_feed_items.limit(20).order(updated_at: :desc)
      end

      @news_feed_items = ActiveModel::ArraySerializer.new(
        @news_feed_to_show
      )

      render 'products/new_show', layout: 'product'
      return
    end

    respond_to do |format|
      format.html { render }
      format.json { render json: @product }
    end
  end

  def plan
    set_product
  end

  # The old show page
  def old
    return redirect_to(about_url) if @product.meta?
    @user_metrics = UserMetricsSummary.new(@product, Date.today - 1.day)

    page_views = TimedSet.new($redis, "#{@product.id}:show")

    if page_views.add(request.remote_ip)
      Product.increment_counter(:view_count, @product.id)
      page_views.drop_older_than(5.minutes)
    end

    respond_to do |format|
      format.html { render 'show' }
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

    Activities::Follow.publish!(
      actor: current_user,
      subject: @product,
      target: @product
    )

    render nothing: true, :status => :ok
  end

  def announcements
    authenticate_user!
    set_product
    @product.announcements!(current_user)
    respond_with @product, location: product_wips_path(@product)
  end

  def unfollow
    @product.unwatch!(current_user)
    render nothing: true, :status => :ok
  end

  def metrics
    raise 'Mixpanel not configured in ENV' if ENV['MIXPANEL_API_KEY'].blank? || ENV['MIXPANEL_API_SECRET'].blank? || ENV['MIXPANEL_CONVERSION_FUNNEL_ID'].blank?
    @user_metrics = UserMetricsExpanded.new(@product)
  end

  def launch
    authorize! :update, @product
    ApplyForPitchWeek.perform_async(@product.id, current_user.id)
    flash[:applied_for_pitch_week] = true
    respond_with @product, location: product_path(@product)
  end

  def schedule_greet
    message = "Hi there! I'm Kernel. #{@product.name} looks pretty sweet. If you need any help, message me at @kernel, and I'll get a human."
    PostChatMessage.perform_async(@product.slug, message, false)
  end

  def schedule_introductory_bounty
    CreateBounty.perform_async(@product.slug)
  end

  def schedule_one_hour_checkin
    eligible_products = Product.public_products
                       .joins(:product_trend)
                       .where('votes_count >= ?', 10)
                       .order('product_trends.score desc')
                       .limit(100)

    index = rand(eligible_products.count)
    example_product = eligible_products[index]

    message = if example_product
      "Why not take a look at [#{example_product.name}](#{product_path(example_product)}) for some inspiration?"
    else
      "Why not take a look at [some of the other products](#{discover_path}) that people have built?"
    end

    PostChatMessage.perform_in(1.hour, @product.slug, message)
  end

  def schedule_one_day_checkin
    CreateProject.perform_in(1.day, @product.slug)

    first_milestone_number = (@product.milestones && @product.milestones.first && @product.milestones.first.number) || 1

    message = "@core, I made something for you: [Launch Checklist](#{product_project_path(@product, first_milestone_number)}). You got this!"

    PostChatMessage.perform_in(1.day, @product.slug, message)
  end
  # private

  def create_product_chat(product)
    main_thread = product.discussions.create!(title: Discussion::MAIN_TITLE, user: current_user, number: 0)
    product.update(main_thread: main_thread)
    product.chat_rooms.create!(wip: main_thread, slug: product.slug)
  end

  def create_product_with_params
    product = current_user.products.create(product_params)
    if product.valid?
      if !current_user.staff?
        track_event 'product.created', ProductAnalyticsSerializer.new(product).as_json
        AsmMetrics.active_user(current_user)
      end

      product.team_memberships.create!(user: current_user, is_core: true)

      product.watch!(current_user)

      create_product_chat(product)

      ownership = params[:ownership] || {}
      core_team_ids = Array(params[:core_team])

      core_team_members = User.where(id: core_team_ids.select(&:uuid?))

      core_team_members.each do |user|
        product.core_team_memberships.create(user: user)
      end

      coins_allocated = ownership.values.map(&:to_i).sum
      founder_coins = 100 * Product::INITIAL_COINS
      TransactionLogEntry.minted!(nil, Time.now, product, current_user.id, founder_coins)
      product.update_partners_count_cache
      product.save!

      AutoTipContract.replace_contracts_with_default_core_team_split(product)

      invitees = (core_team_ids + ownership.keys).uniq
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

      flash[:new_product_callout] = true
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
      :terms_of_service,
      {:tags => []}
    ] + Product::INFO_FIELDS.map(&:to_sym)

    params.require(:product).permit(*fields)
  end
end
