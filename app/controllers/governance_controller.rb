class GovernanceController < ProductController
  respond_to :html, :json

  before_action :set_product
  before_action :authenticate_user!

  def index
    find_product!
    @proposals = Proposal.proposals_on_product(@product)
    @heartables = Heart.store_data(@proposals.map(&:news_feed_item))
    store_data heartables: @heartables

    if signed_in?
      store_data user_hearts: Heart.where(
        user: current_user,
        heartable_id: @heartables.map{ |h| h['heartable_id'] }
      )
    end
  end

end
