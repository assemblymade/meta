class DomainsController < ProductController
  before_action :find_product!

  def create
    authorize! :update, @product

    @domain = @product.domains.create(domain_params.merge(user_id: current_user.id))
    if @domain.valid?
      if @domain.transfer_auth_code
        flash[:success] = "Sit tight! You should get an email from your registrar to confirm"
        Dnsimple::StartDomainTransfer.perform_async(@domain.id)
      else
        @domain.purchase_application!
        flash[:success] = "We'll be in contact soon to discuss your domain purchase"
      end
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