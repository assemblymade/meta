module Api
  class OffersController < Api::ApiController
    before_action :authenticate_user!

    def create
      @product = Product.find_by!(slug: params[:product_id])
      @bounty = @product.tasks.find_by!(number: params[:bounty_id])

      offer_attributes = offer_params

      [:amount, :earnable].each do |key|
        offer_attributes[key] = offer_attributes[key].to_s.gsub(/[^\d.]/, '').to_i if offer_attributes.key?(key)
      end

      @offer = Offer.create!(
        {
          bounty: @bounty,
          user: current_user,
          ip: request.ip
        }.merge(
          offer_attributes.slice(:amount, :earnable)
        )
      )

      respond_with(
        @offer,
        location: api_product_bounty_offer_path(@product, @bounty, @offer)
      )
    end

    private

    def offer_params
      params.permit(:product_id, :bounty_id, :amount, :earnable)
    end
  end
end
