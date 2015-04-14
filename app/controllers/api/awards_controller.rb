class Api::AwardsController < Api::ApiController
  respond_to :json

  before_action :authenticate

  def create
    product = get_product  
    bounty = product.tasks.find_by!(number: params[:bounty_id])
    authorize! :award, bounty

    if winner = User.find_by(email: params[:email])
      award = bounty.award_with_reason(current_user, winner, params[:reason])
    else
      guest = Guest.find_or_create_by!(email: params[:email])
      award = bounty.award_pending_with_reason(current_user, guest, params[:reason])
    end

    respond_with(product, bounty, award, serializer: AwardSerializer)
  end

  def get_product
    product = Product.find_by(slug: params[:org_id])
    if !product
      product = Product.find_by(id: params[:org_id])
    end
    product
  end

end
