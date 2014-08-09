class Users::BalancesController < ApplicationController
  before_action :authenticate_user!


  def show
    @user = current_user.decorate
    @balance = User::Balance.new(current_user)
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

    @balance = User::Balance.new(current_user)

    if @balance.available_to_payout < 10000
      flash[:warning] = "Sorry, you can't withdraw less than $100.00 at this stage"
    else
      @withdrawal = User::Withdrawal.create!(
        user: current_user,
        total_amount: @balance.available_earnings,
        amount_withheld: @balance.available_to_withhold
      )
      UserBalanceMailer.delay(queue: 'mailer').withdrawal_created(@withdrawal.id)
      flash[:success] = "Great! Your withdrawal has been scheduled and you will be notified soon"
    end
    redirect_to users_balance_path
  end
end