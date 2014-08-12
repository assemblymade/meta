module Api
  class OffersController < ApiController
    before_action :authenticate_user!

    def create
      @product = Product.find_by!(slug: params[:product_id])
      @bounty = @product.tasks.find_by!(number: params[:bounty_id])
      @offer = @bounty.offers.create(
        user: current_user,
        amount: offer_params.fetch(:amount),
        ip: request.ip
      )

      respond_with(
        @offer,
        location: api_product_bounty_offer_path(@product, @bounty, @offer)
      )
    end

  private

    def offer_params
      params.permit(:product_id, :bounty_id, :amount)
    end
  end
end
