class Api::BountiesController < Api::ApiController
  respond_to :json

  protect_from_forgery with: :null_session, if: Proc.new { |c| c.request.format == 'application/json' }

  before_action :authenticate, only: [:create]

  def index
    @product = Product.find_by_slug(params[:product_id])
    @bounties = @product.tasks.where.not(state: [:closed, :resolved]).order('priority ASC NULLS LAST').limit(3)

    respond_with(@bounties, each_serializer: BountyShallowSerializer)
  end

  def create
    @product = Product.find_by_slug(params[:product_id])
    @bounty = WipFactory.create(
      @product,
      product_wips,
      current_user,
      request.remote_ip,
      wip_params,
      params[:description]
    )

    if @bounty.valid?
      if (amount = params[:offer].to_i) > 0
        @offer = @bounty.offers.create(user: current_user, amount: amount, ip: request.ip)
      end
    end

    respond_with({}, status: 201, location: product_wips_path(@product))
  end

  private

  def product_wips
    @product.tasks.includes(:workers, :product, :tags)
  end

  def wip_params
    params.require(:task).permit(:title, :description, :deliverable, tag_list: [])
  end
end
