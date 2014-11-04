class DomainsController < ProductController
  before_action :find_product!

  def create
    @domain = @product.domains.create(domain_params)
    if @domain.valid?
      Dnsimple::StartDomainTransfer.perform_async(@domain.id)
      render json: @domain
    else
      render status: 422, json: { errors: @domain.errors }
    end
  end

  # private

  def domain_params
    params.require(:domain).permit(:name, :transfer_auth_code)
  end
end