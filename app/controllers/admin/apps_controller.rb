class Admin::AppsController < AdminController
  def index
    @products = Product.all.includes(showcase_entries: :showcase)

    if params[:q].present?
      @products = @products.where("name ilike ?", "%#{params[:q]}%")
    else
      @products = @products.ordered_by_trend
      if params[:onlyuntagged] == 'true'
        @products = @products.untagged
      end
    end

    @products = @products.page(params[:page]).per(200)

    respond_to do |format|
      format.html { }
      format.json { render json: @products, each_serializer: AppAdminSerializer }
    end
  end

  def update
    @product = Product.find(params[:id])

    @product.update!(app_params)

    render json: @product, serializer: AppAdminSerializer
  end

  def app_params
    params.permit(:tags_string)
  end
end
