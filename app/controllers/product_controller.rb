class ProductController < ApplicationController

  layout 'product'

protected

  def find_product!
    @product = Product.find_by_slug!(params.fetch(:product_id)).decorate
  end

end
