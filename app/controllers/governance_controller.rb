class GovernanceController < ProductController
  respond_to :html, :json

  before_action :set_product
  before_action :authenticate_user!

  def index
    find_product!

    @open_proposals = Proposal.where(product: @product).where(state: "open")
    @active_proposals = Proposal.where(product: @product).where(state: "active")
    @closed_proposals = Proposal.where(product: @product).where(state: ['closed', 'failed', 'expired'])

  end

  def create

  end


end
