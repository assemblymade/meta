class GovernanceController < ProductController
  respond_to :html, :json

  before_action :set_product
  before_action :authenticate_user!

  def index
    find_product!
    prod_proposals = Proposal.where(product: @product)
    open_proposals = prod_proposals.where(state: "open").sort_by{|a| a.expiration}.reverse
    passed_proposals = prod_proposals.where(state: "passed").sort_by{|a| a.expiration}.reverse
    failed_proposals = prod_proposals.where(state: "failed").sort_by{|a| a.expiration}.reverse
    expired_proposals = prod_proposals.where(state: "expired").sort_by{|a| a.expiration}.reverse
    @proposals = open_proposals + passed_proposals + failed_proposals + expired_proposals

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
