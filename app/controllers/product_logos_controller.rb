class ProductLogosController < ProductController
  respond_to :html, :json

  before_action :find_product!
  before_action :authenticate_user!

  def index
    redirect_to product_assets_path(@product)
  end

  def create
    authorize! :edit, @product

    logo = @product.assets.create(logo_params.merge(user: current_user))

    @product.update_attributes(logo: logo)

    respond_with @product do |format|
      format.html { redirect_to edit_product_path(@product) }
    end
  end

  def show
  end

  def update
  end

  def destroy
  end

  def logo_params
    params.require(:asset).permit(:attachment_id, :name)
  end

end
