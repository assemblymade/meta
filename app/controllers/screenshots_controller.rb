class ScreenshotsController < ProductController
  respond_to :json

  before_action :authenticate_user!
  before_action :set_product

  def create
    @asset = @product.assets.create!(asset_params.merge(user: current_user))
    @screenshot = Screenshot.create!(asset_id: @asset.id, position: position)

    respond_with ScreenshotSerializer.new(@screenshot), status: 201, location: product_screenshots_path(@product)
  end

  private

  def asset_params
    params.require(:asset).permit(:attachment_id, :name)
  end

  def position
    Time.now.to_i
  end
end
