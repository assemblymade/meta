module Api
  class OffersController < ApiController

    def create
      @bounty = Task.find(offer_params.fetch(:bounty_id))
      @offer = Offer.create(
        bounty: @bounty,
        user: current_user || User.first,
        amount: offer_params.fetch(:amount)
      )
      respond_with(@offer, location: api_offer_path(@offer))
    end

  private

    def offer_params
      params.require(:offer)
    end

  end
end
