module Financial
  class FinancialsController < ApplicationController
    def show
      @product = Product.find_by!(slug: params[:product_id]).decorate
      redirect_to product_financial_accounts_path(@product)
    end
  end
end