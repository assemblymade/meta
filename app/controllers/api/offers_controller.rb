module Api
  class OffersController < Api::ApiController
    before_action :authenticate_user!

    def create
      @product = Product.find_by!(slug: params[:product_id])
      @bounty = @product.tasks.find_by!(number: params[:bounty_id])
      @bounty.update(value: offer_params.fetch(:earnable, 0))

      respond_with @bounty.product, @bounty
    end

    private

    def offer_params
      params.permit(:product_id, :bounty_id, :amount, :earnable)
    end
  end
end
