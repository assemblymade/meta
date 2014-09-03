class DiscoverController < ApplicationController

  def fresh
    @applications = PitchWeekApplication.in_pitch_week.approved.
      joins(:product).
      order('products.bio_memberships_count desc').
      page(params[:page])
  end

  def trending
    @products = Product.public_products.
                        where.not(started_building_at: nil).
                        where(live_at: nil).
                        joins(:product_trend).
                        where('watchings_count >= ?', 10).
                        order('product_trends.score desc').
                        page(params[:page])
  end

  def live
    @products = Product.public_products.
                        where.not(live_at: nil).
                        joins(:product_trend).
                        order('product_trends.score desc').
                        page(params[:page])
  end

  def bounties
    if params[:filter].blank?
      cookies[:discover_bounties_filter] ||= 'design'
      redirect_to discover_path(:bounties, filter: cookies[:discover_bounties_filter])
    end

    filter = cookies[:discover_bounties_filter] = params[:filter]

    @filters = [{
      slug: 'all',
      label: 'All',
    },{
      slug: 'design',
      label: 'Design',
    }, {
      slug: 'frontend',
      label: 'Front-End Development',
    }, {
      slug: 'backend',
      label: 'Back-End Development',
    }, {
      slug: 'marketing',
      label: 'Marketing',
    }]

    @filters.each do |f|
      f[:count] = BountyPosting.tagged(f[:slug]).count
    end

    @postings = BountyPosting.joins(bounty: :product).tagged(filter)
    if slug = params[:product]
      @postings = @postings.where('products.slug = ?', slug)
    end

    @postings = @postings.group_by{|p| p.bounty.product }
  end

  def blog
    @posts = Post.joins(:product).
      where('products.flagged_at is null').
      order(created_at: :desc)

    @page = @posts.page(params[:page])
  end
end
