class ContractsController < ProductController
  respond_to :html, :json

  before_action :set_product
  before_action :authenticate_user!

  def index
    find_product!

    @active_contracts = @product.active_contracts
    @closed_contracts = @product.expired_contracts

    @activeTipContracts = @product.auto_tip_contracts.select{|a| a.active?}.map{|b| AutoTipContractSerializer.new(b)}
    @closedTipContracts = @product.auto_tip_contracts.select{|a| !a.active?}.map{|b| AutoTipContractSerializer.new(b)}

  end

  def create
    authorize! :contract, @product

    user = User.find_by!(username: contract_params[:user].strip().sub('@', ''))
    amount = contract_params[:amount].to_f / 100

    contract = AutoTipContract.create!(product: @product, user: user, amount: amount)

    Activities::CreateContract.publish!(
      actor: user,
      subject: @product,
      target: @product
    )

    respond_to do |format|
      format.json { render json: contract.to_json, status: 201 }
      format.html { redirect_to product_contracts_path(@product) }
    end
  end

  def update
    user = contract_params[:user]
    contract = AutoTipContract.find_by!(product: @product, user: user)
    authorize! :update, contract
    proposed_amount = contract_params[:amount].to_f / 100

    AutoTipContract.replace_contract(@product, contract.user, proposed_amount)

    Activities::UpdateContract.publish!(
      actor: contract.user,
      subject: @product,
      target: @product
    )

    respond_to do |format|
      format.json { render json: {}, status: 201 }
    end
  end

  def destroy
    contract = AutoTipContract.find_by!(product: @product, id: params[:id])
    authorize! :destroy, contract

    AutoTipContract.end_contract(@product, contract.user)

    Activities::DestroyContract.publish!(
      actor: contract.user,
      subject: @product,
      target: @product
    )

    respond_to do |format|
      format.json { render json: {}, status: 204 }
    end
  end

  def contract_params
    params.require(:contract).permit(:amount, :user)
  end

end
