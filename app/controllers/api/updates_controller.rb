module Api
  class UpdatesController < ApiController

    def index
      @product = Product.find_by_slug!(params.fetch(:product_id))
      @updates = Post.where(product: @product)
      respond_with(@updates.map {|u| PostSerializer.new(u) })
    end

  end
end
