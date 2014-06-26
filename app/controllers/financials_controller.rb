class FinancialsController < ProductController
  before_action :find_product!

  def index
    unless params[:product_id] == 'coderwall'
      redirect_to product_path(@product)
    end
  end
end
