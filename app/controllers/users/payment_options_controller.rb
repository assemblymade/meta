class Users::PaymentOptionsController < ApplicationController
  before_action :authenticate_user!

  def show
    @user = current_user.decorate
    @payment_option = @user.payment_option || @user.build_payment_option
  end

  def create
    @user = current_user.decorate
    @payment_option = current_user.build_payment_option(payment_option_params)
    @payment_option.save_account!
    if @payment_option.save
      flash[:success] = "Great! We have your payment details"
      redirect_to users_payment_option_path(payment_option: params[:payment_option])
    else
      render action: :show, payment_option: params[:payment_option]
    end
  end

  def update
    @user = current_user.decorate
    @payment_option = current_user.payment_option
    if @payment_option.update_attributes(payment_option_params)
      @payment_option.save_account!
      flash[:success] = "Great! We have your payment details"
      redirect_to users_payment_option_path(payment_option: params[:payment_option])
    else
      render action: :show, payment_option: params[:payment_option]
    end
  end

  # private

  def payment_option_params
    params.require(:payout_settings).permit(
      :bitcoin_address,
      :type
    ).merge(card_token: params.fetch(:stripeToken))
  end
end
