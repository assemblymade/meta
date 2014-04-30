class WhiteboardController < ApplicationController
  respond_to :html, :js

  before_action :authenticate_staff!, :only => :destroy
  before_action :find_product!

  def index
    @assets = WhiteboardAsset
      .joins(:comment => :wip)
      .where(wips: {product_id: @product.id})
      .order(:created_at => :desc)
  end

  def destroy
    # TODO This doesn't scope an asset by product
    @asset = WhiteboardAsset.find(params.fetch(:id))
    @asset.delete!
    render :text => 'ok'
  end

private

  def find_product!
    @product = Product.find_by_slug!(params.fetch(:product_id)).decorate
  end

end
