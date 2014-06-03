class AssetsController < ApplicationController
  respond_to :html

  before_action :authenticate_user!, :except => [:index]
  before_action :set_product

  def index
    @assets = @product.assets.order('created_at desc').page(params[:page]).per(4*4)
  end

  def create
    @asset = @product.assets.create(asset_params.merge(user: current_user))
    respond_with @asset, location: product_assets_path(@product)
  end

  # private

  def asset_params
    params.require(:asset).permit(:attachment_id, :name)
  end
end