class Users::BalancesController < ApplicationController
  before_action :authenticate_user!

  def show
    @user = current_user.decorate
    @balances = User::BalanceEntry.
      includes(:profit_report).
      where(user: current_user)
    
    @withdrawals = []
    
    @total_balance = @balances.sum(:earnings)
  end
end