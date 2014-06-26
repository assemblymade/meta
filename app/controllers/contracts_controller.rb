class ContractsController < ProductController
  respond_to :html, :json

  before_action :set_product
  before_action :authenticate_user!

  def index
    find_product!
  end

  def create
    user = User.find_by!(username: contract_params[:user].strip().sub!('@', ''))
    amount = contract_params[:amount].to_f / 100

    allContracts = AutoTipContract.where(product: @product.id, deleted_at: nil)

    total = sum_contracts()

    if total + amount > 1
      raise 'Tip contracts cannot exceed total revenue!'
    end

    AutoTipContract.create!(product: @product, user: user, amount: amount)

    respond_to do |format|
      format.html { redirect_to product_contracts_path(@product) }
    end
  end

  def update
    user = contract_params[:user]
    contract = AutoTipContract.find_by!(product: @product, user: user)
    proposed_amount = contract_params[:amount].to_f / 100
    allContracts = AutoTipContract.where(product: @product.id, deleted_at: nil)

    total = sum_contracts()

    if total - contract.amount + proposed_amount > 1
      raise 'Tip contracts cannot exceed total revenue!'
    end

    AutoTipContract.replace_contract(@product, contract.user, proposed_amount)

    respond_to do |format|
      format.json { render json: { total: total } }
    end
  end

  def destroy
    AutoTipContract.transaction do
      AutoTipContract.where(product: @product, id: params[:id]).update_all deleted_at: Time.now
    end

    respond_to do |format|
      format.json { render json: {} }
    end
  end

  def contract_params
    params.require(:contract).permit(:amount, :user)
  end

  def sum_contracts()
    allContracts = AutoTipContract.where(product: @product.id, deleted_at: nil)

    total = allContracts.inject(0) do |memo, c|
      memo + c.amount
    end

    total
  end

end
