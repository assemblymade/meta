module Api
  class UpdatesController < Api::ApiController

    # monsoon hits this
    def index
      @product = Product.find_by_slug!(params.fetch(:product_id))
      @updates = Post.where(product: @product)
      respond_with(@updates.map {|u| PostSerializer.new(u) })
    end

    def paged
      @product = Product.find_by_slug!(params.fetch(:product_id))
      @updates = Post.where(product: @product)
      render json: {
        posts: ActiveModel::ArraySerializer.new(@updates.order(created_at: :desc).page(params[:page])),
        meta: { count: Post.where(product: @product).count }
      }
    end
  end
end
