class WatchersController < ApplicationController

  respond_to :json

  def index
    find_product!
    @watchers = @product.watchers
    respond_with(@watchers)
  end

  def find_product!
    @product = Product.find_by_slug(params.fetch(:product_id))
  end

end
