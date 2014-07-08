class ProductController < ApplicationController

  layout 'product'

protected

  def find_product!
    id = params[:product_id] || params[:id]
    if id.uuid?
      @product = Product.find(id).decorate
    else
      @product = Product.launched.find_by_slug!(id).decorate
    end
    authorize! :read, @product
  end
  alias_method :set_product, :find_product!

end
