class GovernanceController < ProductController
  respond_to :html, :json

  before_action :set_product
  before_action :authenticate_user!

  def index
    find_product!
    @proposals = @product.proposals_sorted
    @heartables = Heart.store_data(@proposals.map(&:news_feed_item))

    if signed_in?
      @user_hearts = Heart.where(
        user: current_user,
        heartable_id: @heartables.map{ |h| h['heartable_id'] }
      )
    end
  end

  def create

  end
end
