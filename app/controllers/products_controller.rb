require 'timed_set'
require 'csv'

class ProductsController < ProductController
  respond_to :html, :json

  before_action :authenticate_user!, only: [:new, :create, :edit, :update, :follow, :unfollow, :announcements, :welcome]
  before_action :set_product,
    only: [:show, :activity, :old, :edit, :update, :follow, :announcements, :unfollow, :metrics, :flag, :feature, :launch]

  after_action :record_page_view, only: [:show]

  MARK_DISPLAY_LIMIT = 14
  PRODUCT_MARK_DISPLAY_LIMIT = 6

  def new
    @product = Product.new
    @product.user = current_user

    @four_word_story_example = [
        'Organize everything you love.',
        'Easily find useful information.'
      ].sample

    @idea = Idea.find_by(id: params[:idea_id])

    if @idea
      @participants = @idea.participants.map{|a| UserSerializer.new(a)}
    else
      @participants = []
    end

    render layout: 'application'
  end

  def start
    @profit = ProfitReport.all.map(&:profit).sum.round(-6)
    render layout: 'application'
  end

  def checklistitems
    find_product!
    ordered_tasks = @product.tasks.where.not(display_order: nil).order(display_order: :asc)
    completed_ordered_tasks = ordered_tasks.where.not(state: ["open", "allocated"]).count

    if ordered_tasks.count == 0
      completion = 0
    else
      completion = ((completed_ordered_tasks.to_f / ordered_tasks.count.to_f)*100).round(2)
    end

    ordered_tasks = ActiveModel::ArraySerializer.new(ordered_tasks.take(6))

    render json: {tasks: ordered_tasks, percent_completion: completion}
  end

  def greenlight
    find_product!
    authorize! :update, @product

    @product.update!({state: "greenlit", greenlit_at: Time.now})
    render json: {message: "Success"}
  end

  def ownership
    find_product!
    ownership = CsvCompiler.new.get_product_partner_breakdown(@product)

    csv_file = CSV.generate({}) do |csv|
      ownership.each do |a|
        csv << a
      end
    end
    send_data csv_file, :type => 'text/csv'
  end

  def create
    if idea_id = params[:product]
      @idea = Idea.find(idea_id)
      authorize! :update, @idea
    end

    @product = create_product_with_params(@idea)
    if @product.valid?
      respond_with(@product, location: product_path(@product))
    else
      render action: :new, layout: 'application'
    end
  end

  def coin
    find_product!
    if @product
      if @product.coin_info
        render json: CoinInfoSerializer.new(@product.coin_info)
      else
        render json: {}
      end
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

  def activity
    respond_to do |format|
      format.html { render 'show' }
      format.json {
        news_feed_items = @product.news_feed_items

        @top_wip_tags = QueryMarks.new.leading_marks_on_product(@product, MARK_DISPLAY_LIMIT).map do |name, number|
          name
        end

        @post_marks = Marking.includes(:mark).uniq.
          where(markable_type: Post, markable_id: news_feed_items.pluck(:target_id)).pluck(:name)

        query = FilterUpdatesQuery.call(news_feed_items, filter_params)

        query = query.page(params[:page]).per(10).order(last_commented_at: :desc)
        total_pages = query.total_pages

        @news_feed_items = query.map do |nfi|
          Rails.cache.fetch([nfi, 'v2', :json]) do
            NewsFeedItemSerializer.new(nfi).as_json
          end
        end

        @heartables = (@news_feed_items + @news_feed_items.map{|p| p[:last_comment]}).compact

        if signed_in?
          @user_hearts = Heart.where(user: current_user, heartable_id: @heartables.map{|h| h[:id]})
        end
        render json: {
          bounty_marks: @top_wip_tags,
          heartables: @heartables,
          items: @news_feed_items,
          page: params[:page] || 1,
          pages: total_pages,
          post_marks: @post_marks,
          product: ProductSerializer.new(
            @product,
            scope: current_user
          ),
          screenshots: ActiveModel::ArraySerializer.new(
            @product.screenshots.order(position: :asc).limit(6),
            each_serializer: ScreenshotSerializer
          ),
          user_hearts: @user_hearts
        }
      }
    end
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

    show_product
  end

  def plan
    set_product
  end

  def edit
    authorize! :update, @product
    @upgrade_stylesheet = true
  end

  def update
    authorize! :update, @product

    # since we don't know what the subsections hash
    # will look like, we need to have this janky if-check
    if params[:subsections]
      if params[:subsections].blank?
        @product.update(subsections: {})
      else
        @product.update(subsections: params[:subsections])
      end
    else
      @product.update!(product_params)
    end

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

  def launch
    authorize! :update, @product
    ApplyForPitchWeek.perform_async(@product.id, current_user.id)
    flash[:applied_for_pitch_week] = true
    respond_with @product, location: product_path(@product)
  end

  # private

  def create_product_with_params(idea)
    product = current_user.products.create(product_params)
    if product.valid?
      ChatRoom.create_for(product)
      Karma::Kalkulate.new.award_for_product_to_stealth(product)

      if idea
        idea.update(product_id: product.id)
        product.reload

        chosen_ids = (params[:product][:partner_ids] || '').split(',').flatten
        upgrade_idea_to_product(idea, product, chosen_ids)
      end

      AutoBounty.new.product_initial_bounties(product)
    end
    product
  end

  def upgrade_idea_to_product(idea, product, initial_partner_ids)
    # TODO (barisser) --> Make this asynchronous.  Currently will cause tests to fail if asynchronous.
    GiveCoinsToParticipants.new.perform(chosen_ids, product.id)

    chosen_ids.each do |chosen_id|
      EmailLog.send_once(chosen_id, idea.slug) do
        # TODO (whatupdave): remove queue when we upgrade to activejob
        PartnershipMailer.delay(queue: 'mailer').create(chosen_id, product.id, idea.id)
      end
    end

    # TODO (whatupdave): barisser knows where to put this
    mention = product.user.twitter_nickname
    if !mention
      mention = " "
    else
      mention = " @"+mention+" "
    end
    tweet_text = "The idea #{idea.name} just became a product called #{product.name}#{mention}#{product_url(product)}"
    TweetWorker.perform_async(tweet_text)
    # ---

  end

  def show_product
    respond_to do |format|
      format.html { render 'show' }
      format.json {
        render json: {
          product: ProductSerializer.new(
            @product,
            scope: current_user
          ).as_json.merge(partners: json_array(@product.partners(20))),
          screenshots: ActiveModel::ArraySerializer.new(
            @product.screenshots.order(position: :asc).limit(6),
            each_serializer: ScreenshotSerializer
          )
        }
      }
    end
  end

  def make_idea
    authorize! :update, @product
    product = Product.find_by_slug!(params[:product_id])

    @idea = Idea.create_with_discussion(
      product.user,
      name: product.pitch,
      body: product.description,
      created_at: product.created_at,
      flagged_at: product.flagged_at,
      founder_preference: true,
      product_id: product.id
    )

    (product.votes + product.watchings + product.team_memberships).map do |h|
      next unless h.user_id

      heart = @idea.news_feed_item.hearts.find_or_initialize_by(user_id: h.user_id)
      heart.created_at = h.created_at
      heart.save!
    end

    @idea.news_feed_item.update_column('last_commented_at', product.created_at)

    render json: @idea
  end

  def filter_params
    params.permit(:archived, :mark, :type)
  end

  def product_params
    fields = [
      :name,
      :pitch,
      :lead,
      :description,
      :tags_string,
      :greenlit_at,
      :poster,
      :state,
      :homepage_url,
      :try_url,
      :you_tube_video_url,
      :terms_of_service,
      {:tags => []},
      :partner_ids,
      :idea_id
    ] + Product::INFO_FIELDS.map(&:to_sym)

    params.require(:product).permit(*fields)
  end

  def record_page_view
    page_views = TimedSet.new($redis, "#{@product.id}:show")
    if page_views.add(request.remote_ip)
      Product.increment_counter(:view_count, @product.id)
      page_views.drop_older_than(5.minutes)
    end
  end
end
