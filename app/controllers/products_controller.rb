require 'timed_set'
require 'csv'

class ProductsController < ProductController
  respond_to :html, :json

  before_action :authenticate_user!, only: [:new, :create, :edit, :update, :follow, :unfollow, :announcements, :welcome]
  before_action :set_product,
    only: [:show, :activity, :old, :edit, :update, :follow, :announcements, :unfollow, :metrics, :flag, :feature, :launch]

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

  def checklistitem
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
    if idea_id = params[:product].delete(:idea_id)
      @idea = Idea.find(idea_id)

      return redirect_to action: :new, layout: 'application' unless @idea.user == current_user
    end

    @product = create_product_with_params
    if @product.valid?

      Karma::Kalkulate.new.award_for_product_to_stealth(@product)

      @product.retrieve_key_pair

      if @idea
        @idea.update(product_id: @product.id)
      end

      chosen_ids = params[:product][:partner_ids] || ''
      chosen_ids = chosen_ids.split(',').flatten
      GiveCoinsToParticipants.new.perform(chosen_ids, @product.id)

      # chosen_ids.each do |a|
      #   EmailLog.send_once(a, the_key) do
      #     PartnershipMailer.delay(queue: 'mailer').create(a, @product.id, @idea.id)
      #   end
      # end

      AutoPost.new.generate_idea_product_transition_post(@product)
      current_user.touch
      @product.reload

      respond_with(@product, location: product_path(@product))
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

  def activity
    show_product
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

  def create_product_chat(product)
    main_thread = product.discussions.create!(title: Discussion::MAIN_TITLE, user: current_user, number: 0)
    product.update(main_thread: main_thread)
    product.chat_rooms.create!(wip: main_thread, slug: product.slug)
  end

  def create_product_with_params
    product = current_user.products.create(product_params)
    if product.valid?
      product.team_memberships.create!(user: current_user, is_core: true)

      product.watch!(current_user)

      create_product_chat(product)

      ownership = params[:ownership] || {}
      core_team_ids = Array(params[:core_team])

      core_team_members = User.where(id: core_team_ids.select(&:uuid?))

      core_team_members.each do |user|
        product.core_team_memberships.create(user: user)
      end

      product.update_partners_count_cache
      product.save!

      flash[:new_product_callout] = true
    end
    product
  end

  def show_product
    page_views = TimedSet.new($redis, "#{@product.id}:show")

    if page_views.add(request.remote_ip)
      Product.increment_counter(:view_count, @product.id)
      page_views.drop_older_than(5.minutes)
    end

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
    store_data news_feed_items: @news_feed_items

    @heartables = (@news_feed_items + @news_feed_items.map{|p| p[:last_comment]}).compact
    store_data heartables: @heartables

    if signed_in?
      store_data user_hearts: Heart.where(user: current_user, heartable_id: @heartables.map{|h| h['id']})
    end

    respond_to do |format|
      format.html { render 'show' }
      format.json {
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
      :poster,
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
end
