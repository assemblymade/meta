class DiscoverController < ApplicationController
  META = Product.find_by(slug: 'meta')
  COUNTABLE_FILTERS = [
    'Frontend',
    'Backend',
    'Design',
    'Marketing',
    'Writing',
    'Mobile'
  ]

  def index
    @interesting = interesting_products.limit(3)
    @profitable = profitable_products.limit(4)
    @greenlit = greenlit_products.limit(20)
    @team_building = team_building_products.limit(20)
    # --
    @products = Product.includes(:logo)
                       .where.not(slug: 'meta')
                       .where(flagged_at: nil)
                       .where(state: %w(greenlit profitable team_building))
                       .limit(100)

    if params[:tag].present?
      # transform tag here so that the label in the HTML is still "writing"
      tag = if params[:tag] == 'writing'
        'copy'
      elsif params[:tag] == 'mobile'
        ['mobile', 'ios', 'android']
      else
        params[:tag]
      end

      @products = @products.joins(wips: { taggings: :tag })
                            .where(
                              wip_tags: { name: tag },
                              wips: { state: 'open' }
                            )
    end

    if params[:mark].present?
       @products = @products.with_mark(params[:mark])
    end

    @products = case params[:sort]
      when 'trending'
        @products.ordered_by_trend
      when 'new'
        @products.order('products.started_team_building_at DESC')
      when 'teambuilding'
        @products.sort_by {|p| p.bio_memberships_count }
      when 'suggested'
        @products = current_user.top_products.pluck(:product_id).map{|a| Product.find(a) }
      else # popular
        @products.sort_by {|p| -p.partners_count }
      end

  end

  def profitable
    @products = profitable_products.page(params[:page])
  end

  def greenlit
    @products = greenlit_products.page(params[:page])
  end

  def team_building
    @products = team_building_products.page(params[:page])
  end

   def bounties
    default_filter = cookies[:discover_bounties_filter] || 'design'
    @filter = cookies[:discover_bounties_filter] = params.fetch(:filter, default_filter)

    redirect_to discover_path(:bounties, filter: @filter) if params[:filter].blank?

    @postings = Task.open.unflagged.tagged_with(@filter).order(created_at: :desc).
      includes(:product).where(products: { flagged_at: nil }).where.not(products: { state: 'stealth'}).
      page(params[:page]).per(25)

    @postings = @postings.where(products: { slug: params[:product] }) if params[:product]

    if params[:filter] == 'suggested'
      @postings = current_user.top_bountys.map{|a| Task.find(a.wip_id)}
    end

  end

  def updates
    limit = 20
    offset = params[:page] ? (params[:page].to_i - 1) * limit : 0

    # (pletcher) This is so ugly -- maybe we should move tags to
    #            NewsFeedItems?
    query = if params[:filter] && params[:filter] != 'hot'
      Wip.tagged_with(params[:filter]).
                limit(limit).
                offset(offset).
                includes(:news_feed_item).
                where.not('news_feed_items.product_id = ?', META.id).
                order(updated_at: :desc).
                map(&:news_feed_item)
    else
      NewsFeedItem.public_items.
                limit(limit).
                offset(offset).
                where.not(product: META).
                order(updated_at: :desc)
    end

    if params[:filter] == 'hot'
      query = query.where.not(popular_at: nil)
    end

    posts = query.to_a.reject{ |q| q.try(:target).try(:flagged?) }

    @posts = posts.map do |post|
      Rails.cache.fetch([post, :json]) do
        NewsFeedItemSerializer.new(post).as_json
      end
    end

    @counts = Rails.cache.fetch("/discover/updates/counts", expires_in: 12.hours) do
      COUNTABLE_FILTERS.reduce({}) do |memo, filter|
        filter = filter.downcase
        memo[filter] = Wip.tagged_with(filter).count
        memo
      end
    end

    @heartables = (@posts + @posts.map{|p| p[:last_comment]}).
            map(&:as_json).
            compact.
            map(&:stringify_keys).
            map{|h| h.slice('heartable_id', 'heartable_type', 'hearts_count') }.to_a


    if signed_in?
      @user_hearts = Heart.where(user: current_user, heartable_id: @heartables.map{|h| h['heartable_id']})
    end

    respond_to do |format|
      format.html
      format.json {
        render json: {
          user_hearts: @user_hearts,
          items: @posts
        }
      }
    end
  end

  def popular_updates

  end

  def profitable_products
    trendy_products.profitable
  end

  def greenlit_products
    trendy_products.greenlit
  end

  def team_building_products
    trendy_products.team_building.includes(:user)
  end

  def interesting_products
    unless current_user && current_user.interested_tags.present?
      return Product.none
    end

    Product.joins(wips: :tags).
      where(flagged_at: nil).
      where(state: ['greenlit', 'profitable']).
      where(wip_tags: { name: current_user.interested_tags }).
      group('products.id')
  end

  def trendy_products
    Product.ordered_by_trend
  end

  def filters
    {
      design:   'Featured Design Bounties',
      frontend: 'Featured Front-End Development Bounties',
      backend:  'Featured Back-End Development Bounties',
      product:  'Featured Product Bounties',
      suggested: 'Suggested Bounties for You'
    }.with_indifferent_access
  end

  helper_method :filters
end
