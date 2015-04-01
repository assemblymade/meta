module Api
  class AwardsController < Api::ApiController
    respond_to :json

    before_action :authenticate_user!

    def create
      product = Product.find_by(slug: params[:product_id])
      bounty = product.tasks.find_by(number: params[:bounty_id])
      authorize! :award, bounty

      winner = User.find_by(email: params[:email])
      comment = Event::Comment.create(
        wip: bounty,
        body: params[:reason],
        user: winner
      )

      award = bounty.award!(winner, comment)

      respond_with award,
        location: api_product_bounty_award_path(product, bounty, award)
    end

    def show
    end
  end
end
