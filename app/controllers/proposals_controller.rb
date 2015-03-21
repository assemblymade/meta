class ProposalsController < ProductController
  respond_to :html, :json

  STANDARD_PROPOSAL_DURATION = 30.days

  before_action :set_product
  before_action :authenticate_user!

  def index
  end

  def create
    params['recipient'].slice!(0)
    username = params['recipient']
    recipient = User.find_by(username: username)

    date = DateTime.parse(params['date'])
    if recipient
      author_user = current_user
      product = @product
      total_coins = params['coins']
      intervals = 1
      start_date = 0.days.from_now
      expiration_date = date
      name = params['name']
      description = params['description']
      proposal_duration = STANDARD_PROPOSAL_DURATION
      recipient_user = recipient
      Governance.new.create_vesting_proposal(author_user, product, total_coins, intervals, start_date, expiration_date, name, description, proposal_duration, recipient_user)
    end
    redirect_to product_governance_index_path(@product)

  end

  def show
    @proposal = Proposal.find(params[:id])
    @proposal_n = Proposal.all.find_index(@proposal)+1

    @heartables = Heart.store_data([@proposal].map(&:news_feed_item))
    store_data heartables: @heartables

    if signed_in?
      store_data user_hearts: Heart.where(
        user: current_user,
        heartable_id: @heartables.map{ |h| h['heartable_id'] }
      )
    end


  end

  def edit

  end

end
