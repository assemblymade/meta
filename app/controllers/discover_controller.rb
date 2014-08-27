class DiscoverController < ApplicationController

  def bounties
    if params[:filter].blank?
      cookies[:discover_bounties_filter] ||= 'design'
      redirect_to discover_path(:bounties, filter: cookies[:discover_bounties_filter])
    end

    filter = cookies[:discover_bounties_filter] = params[:filter]

    @filters = [{
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
      f[:count] = BountyPosting.tagged(filter).count
    end

    @postings = BountyPosting.tagged(filter)

    @postings = @postings.group_by{|p| p.bounty.product }
  end

  def blog
    @posts = Post.joins(:product).
      where('products.flagged_at is null').
      order(created_at: :desc)

    @page = @posts.page(params[:page])
  end
end
