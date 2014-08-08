class Users::BalancesController < ApplicationController
  before_action :authenticate_user!


  def show
    set_report_info
    @user = current_user.decorate
    @earnings = @final_balances.map(&:earnings).reduce(:+)
    @paid_withholding = @withdrawals.sum(:amount_withheld)
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

    set_report_info

    if @payable_earnings < 10000
      flash[:warning] = "Sorry, you can't withdraw less than $100.00 at this stage"
    else
      @withdrawal = User::Withdrawal.create!(
        user: current_user,
        total_amount: @final_balances.map(&:earnings).reduce(:+),
        amount_withheld: @payable_withholding
      )
      UserBalanceMailer.delay(queue: 'mailer').withdrawal_created(@withdrawal.id)
      flash[:success] = "Great! Your withdrawal has been scheduled and you will be notified soon"
    end
    redirect_to users_balance_path
  end

  def set_report_info
    @balances = User::BalanceEntry.
          includes(:profit_report).
          where(user: current_user).
          order('profit_reports.end_at desc')

    @final_balances = @balances.select{|b| Time.now > b.profit_report.grace_ends_at }
    @withdrawals = User::Withdrawal.where(user: current_user).order(created_at: :desc)
    @payable_earnings = @final_balances.map(&:payable_earnings).reduce(:+) - @withdrawals.sum(:total_amount)
    @payable_withholding = @final_balances.map(&:withholding).reduce(:+)
  end
end