class Api::BountiesController < Api::ApiController
  respond_to :json
  before_action :authenticate, only: [:create]

=begin
  @api {post} /orgs/:org_id/bounties Create new bounty
  @apiName CreateBounty
  @apiDescription This operation is only available to Partners in the organization
  @apiGroup Bounties

  @apiParam {String} title        Mandatory A short title
  @apiParam {String} description  Mandatory Detailed description
  @apiParam {Number} coins        Optional  Amount of coins available. Only core team members can set this
=end

  def index
    @product = Product.find_by!(slug: params[:org_id])
    @bounties = @product.tasks.where.not(state: [:closed, :resolved]).order('priority ASC NULLS LAST').limit(3)

    respond_with(@bounties, each_serializer: BountyShallowSerializer)
  end

  def create
    @product = Product.find_by!(slug: params[:org_id])

    authorize! :create_bounty, @product
    @bounty = WipFactory.create(
      @product,
      product_wips,
      current_user,
      request.remote_ip,
      wip_params,
      params[:description]
    )

    if @bounty.valid?
      if @product.core_team?(current_user) && (amount = params[:coins].to_i) > 0
        @bounty.update(value: amount)
      end
      @bounty.reload

      render json: @bounty, serializer: BountyApiSerializer, status: 201
    else

      render json: {
        message: "Validation Failed",
        errors: @bounty.errors
      }, status: :unprocessable_entity
    end
  end

  def show
    @product = Product.find_by!(slug: params[:org_id])
    @bounty = @product.tasks.find_by!(number: params[:id])

    render json: @bounty, serializer: BountyApiSerializer
  end

  private

  def product_wips
    @product.tasks.includes(:workers, :product, :tags)
  end

  def wip_params
    params.require(:title)
    params.require(:description)
    params.permit(:description, :title, tag_list: [])
  end
end
