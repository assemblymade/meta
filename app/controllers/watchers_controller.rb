class WatchersController < ProductController
  respond_to :json, :html

  def index
    set_product
    @watchers = @product.watchers.order('lower(username)')
    respond_with(@watchers)
  end
end
