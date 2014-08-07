class Users::BalancesController < ApplicationController
  before_action :authenticate_user!


  def show
    @user = current_user.decorate
    @balances = find_balance_entries
    @withdrawals = User::Withdrawal.where(user: current_user)

    @total_balance = total_balance
  end

  def withdraw
    if current_user.tax_info.nil?
      flash[:info] = "Please finalize your tax information"
      redirect_to users_tax_info_path
      return
    elsif !current_user.payment_option?
      flash[:info] = "Please select a payment option"
      redirect_to users_payment_option_path
      return
    end

    @balances = find_balance_entries
    @withdrawals = User::Withdrawal.where(user: current_user)
    amount = total_balance
    if amount < 10000
      flash[:warning] = "Sorry, you can't withdraw less than $100.00 at this stage"
    else
      @withdrawal = User::Withdrawal.create!(user: current_user, amount: total_balance)
      UserBalanceMailer.delay(queue: 'mailer').withdrawal_created(@withdrawal.id)
      flash[:success] = "Great! Your withdrawal has been scheduled and you will be notified soon"
    end
    redirect_to users_balance_path
  end

  def find_balance_entries
    User::BalanceEntry.
          includes(:profit_report).
          where(user: current_user).
          order('profit_reports.end_at desc')
  end

  def total_balance
   @balances.sum(:earnings) - @withdrawals.sum(:amount)
  end
end