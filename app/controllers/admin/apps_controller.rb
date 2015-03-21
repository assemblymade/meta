class Admin::AppsController < AdminController
  def index
    @showcases = Showcase.active
    @topics = Topic.all
    @products = Product.all.includes(showcase_entries: :showcase).where(flagged_at: nil)

    if params[:q].present?
      @products = @products.where("name ilike ?", "%#{params[:q]}%")
    else
      @products = @products.ordered_by_trend
      if params[:onlyuntagged] == 'true'
        @products = @products.untagged
      end
    end

    @products = @products.page(params[:page]).per(200)
    store_data products: @products

    respond_to do |format|
      format.html { }
      format.json { render json: @products, each_serializer: AppAdminSerializer }
    end
  end

  def update
    @product = Product.find(params[:id])
    if !@product.showcase_entries.empty? && app_params[:showcase].blank?
      @product.showcase_entries.map(&:destroy)
    else
      @product.update!(app_params)
    end
    render json: @product, serializer: AppAdminSerializer
  end

  def app_params
    params.permit(:tags_string, :topic, :showcase)
  end
end
