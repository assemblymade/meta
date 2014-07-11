class ProductController < ApplicationController

  layout 'product'

protected

  def find_product!
    id = params[:product_id] || params[:id]
    if id.uuid?
      @product = Product.find(id).decorate
      redirect_to product_path(@product.slug) if @product.launched?
    else
      @product = Product.find_by_slug!(id).decorate
    end
    authorize! :read, @product
  end
  alias_method :set_product, :find_product!

end
