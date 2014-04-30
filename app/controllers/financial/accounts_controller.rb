module Financial
  class AccountsController < ApplicationController
    before_action :set_product

    def index
      @accounts = @product.financial_accounts.order(:name)
      @transactions = @product.financial_transactions.order('created_at desc')
    end

    def show
      @account = @product.financial_accounts.find(params[:id])
    end
  end
end