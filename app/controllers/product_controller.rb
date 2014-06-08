class ProductController < ApplicationController

protected

  def find_product!
    @product = Product.find_by_slug!(params.fetch(:product_id))
  end

end
