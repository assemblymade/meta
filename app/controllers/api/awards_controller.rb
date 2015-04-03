class Api::AwardsController < Api::ApiController
  respond_to :json

  before_action :authenticate

  def create
    product = Product.find_by!(slug: params[:org_id])
    bounty = product.tasks.find_by!(number: params[:bounty_id])
    authorize! :award, bounty

    if winner = User.find_by(email: params[:email])
      award = bounty.award_with_reason(current_user, winner, params[:reason])
    else
      # TODO: Send award email
    end

    respond_with award,
      location: api_product_bounty_award_path(product, bounty, award)
  end

  def show
  end
end
