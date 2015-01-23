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

    @heartables = Heart.store_data([@proposal].map(&:news_feed_item))

    if signed_in?
      @user_hearts = Heart.where(
        user: current_user,
        heartable_id: @heartables.map{ |h| h['heartable_id'] }
      )
    end


  end

  def edit
    @proposal = Proposal.find(params[:id])
  end

end
