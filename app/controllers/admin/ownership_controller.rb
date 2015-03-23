class Admin::OwnershipController < AdminController
  def index
    products = Product.all

    case params[:filter]
    when 'greenlit', nil
      products = products.where(state: 'greenlit')
    when 'teambuilding'
      products = products.where(state: 'teambuilding')
    when 'reviewing'
      products = products.where(state: 'reviewing')
    end

    case params[:sort]
    when 'age_asc'
      products.order(created_at: :asc)
    when 'age_desc'
      products.order(created_at: :desc)
    when 'activity', nil
      products = products.joins(:activities).select('products.id, products.created_at, products.name, products.homepage_url,  count(activities) AS activities_count').group("products.name, products.id, products.created_at, products.homepage_url").order('activities_count desc')
    end

    @products = products.page(params[:page])
    store_data(:product)  end

  def update
    ownership_status = OwnershipStatus.find(params[:id])
    case params["event"]
    when "request"
      ownership_status.request!
    when "set pending 30"
      ownership_status.set_pending_30!
    when "set pending 60"
      ownership_status.set_pending_60!
    when "set not applicable"
      ownership_status.set_not_applicable!
    when "unown"
      ownership_status.unown!
    when "undo"
      ownership_status.undo!
    when "owned"
      ownership_status.own!
    end

    respond_to do |format|
      format.html {}
      format.json {render json: ownership_status}
    end
  end
end
