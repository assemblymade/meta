module Financial
  class TransactionsController < ApplicationController
    before_action :set_product

    def show
      @transaction = @product.financial_transactions.find(params[:id])
    end

    def create
      authorize! :create, Transaction
      @transaction = Transaction.create!(transaction_params.merge(product: @product))

      redirect_to product_financial_accounts_path(@product)
    end

    # private

    def transaction_params
      params.require(:transaction).permit(:description, debits: [:account_name, :amount], credits: [:account_name, :amount])
    end
  end
end