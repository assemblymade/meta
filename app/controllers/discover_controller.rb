class DiscoverController < ApplicationController
  def index
    @interesting = interesting_products.limit(3)
    @profitable = profitable_products.limit(4)
    @greenlit = greenlit_products.limit(20)
    @team_building = team_building_products.limit(20)
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
  end

  def updates
    @posts = Post.joins(:product).
      where.not(products: { state: ['stealth', 'reviewing'] }).
      where(products: { flagged_at: nil }).
      where(flagged_at: nil).
      order(created_at: :desc)

    @page = @posts.page(params[:page])
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
      product:  'Featured Product Bounties'
    }.with_indifferent_access
  end
  helper_method :filters
end
