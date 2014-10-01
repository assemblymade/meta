class DiscoverController < ApplicationController
  def index
    @profitable = Product.profitable.
      ordered_by_trend.
      limit(4)

    @greenlit = Product.greenlit.
      ordered_by_trend.
      limit(20)

    @teambuilding = Product.teambuilding.includes(:user).
      ordered_by_trend.
      limit(20)
  end

  def profitable
    @products = Product.profitable.
      ordered_by_trend.
      page(params[:page])
  end

  def greenlit
    @products = Product.greenlit.
      ordered_by_trend.
      page(params[:page])
  end

  def teambuilding
    @products = Product.teambuilding.
      ordered_by_trend.
      page(params[:page])
  end

  def bounties
    default_filter = cookies[:discover_bounties_filter] || 'design'
    @filter = cookies[:discover_bounties_filter] = params.fetch(:filter, default_filter)

    redirect_to discover_path(:bounties, filter: @filter) if params[:filter].blank?

    @postings = Task.open.unflagged.tagged_with(@filter).order(created_at: :desc).
      includes(:product).where(products: { flagged_at: nil }).
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
