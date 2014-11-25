class AssetsController < ProductController
  respond_to :html

  before_action :authenticate_user!, :except => [:index]
  before_action :find_product!

  def index
    @assets = @product.assets.order('created_at desc').page(params[:page]).per(4*4)
  end

  def new
    @asset = @product.assets.new
  end

  def create
    @asset = @product.assets.create(asset_params.merge(user: current_user))
    @room = Room.create_for!(@asset.product, @asset)
    respond_with @asset, location: product_assets_path(@product)
  end

  # private

  def asset_params
    params.require(:asset).permit(:attachment_id, :name)
  end
end
