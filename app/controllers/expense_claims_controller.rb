class ExpenseClaimsController < ProductController
  before_action :authenticate_user!
  before_action :find_product!

  respond_to :html

  def create
    @expense_claim = @product.expense_claims.create(create_params)
    if @expense_claim.valid?
      Array(create_params[:attachment_ids]).each do |id|
        @expense_claim.expense_claim_attachments.create(attachment_id: id)
      end
    end

    respond_with @expense_claim, location: product_financials_path(@product)
  end

  # private

  def create_params
    params.require(:expense_claim).permit(:total_dollars, :description, attachment_ids: []).merge(user: current_user)
  end
end
