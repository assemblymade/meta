class ProposalsController < ProductController
  respond_to :html, :json

  before_action :set_product
  before_action :authenticate_user!

  def index

  end

  def create

  end

  def show
    @proposal = Proposal.find(params[:id])
    @proposal_n = Proposal.all.find_index(@proposal)+1
  end


end
