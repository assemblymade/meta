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
    if params[:filter].blank?
      if cookies[:discover_bounties_filter].blank?
        cookies[:discover_bounties_filter] = 'design'
      end
      redirect_to discover_path(:bounties, filter: cookies[:discover_bounties_filter])
    end

    filter = cookies[:discover_bounties_filter] = params[:filter]
    params[:filter_text] = params[:filter] == 'design' ? '' : params[:filter]

    @filters = [{
      tagged: 'design',
      shortlabel: 'Design',
      label: 'Featured Design Bounties',
    }, {
      tagged: 'frontend',
      shortlabel: 'Frontend',
      label: 'Featured Front-End Development Bounties',
    }, {
      tagged: 'backend',
      shortlabel: 'Backend',
      label: 'Featured Back-End Development Bounties',
    }, {
      tagged: 'product',
      shortlabel: 'Product',
      label: 'Featured Product Bounties',
    }
    ]

    @filters.each do |f|
      if tag = f[:tagged]
        f[:count] = Task.tagged_with(f[:tagged]).count
        f[:slug] = tag
      else
        f[:count] = Task.count
      end
    end

    @filter = @filters.find {|f| f[:slug] == params[:filter] }

    @postings = Task.open.unflagged.
                  includes(:product).
                  order(created_at: :desc).
                  where(products: { flagged_at: nil }).
                  tagged_with(filter)

    if slug = params[:product]
      @postings = @postings.where('products.slug = ?', slug)
    end

    @postings = @postings.page(params[:page]).per(25)
  end

  def updates
    @posts = Post.joins(:product).
      where.not(products: { started_teambuilding_at: nil }).
      where(products: { flagged_at: nil }).
      where(flagged_at: nil).
      order(created_at: :desc)

    @page = @posts.page(params[:page])
  end
end
