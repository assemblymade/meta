class Users::ProfilesController < ApplicationController
  before_action :authenticate_user!
  respond_to :html, :json

  def edit
    @user = current_user
  end

  def update
    current_user.update_attributes(user_params)
    respond_with current_user, location: user_path(current_user)
  end

  def payment
    @user = current_user.decorate

    payment_option = current_user.payment_option || PaymentOption::PAYPAL
    @payment_options = [{
        name: 'Paypal (International)',
        value: PaymentOption::PAYPAL,
        selected: (payment_option == PaymentOption::PAYPAL)
      }, {
        name: 'Direct Deposit (U.S. Only)',
        value: PaymentOption::ACH,
        selected: (payment_option == PaymentOption::ACH)
      }]
  end

  # private

  def user_params
    params.require(:user).permit(:payment_option, :paypal_email, :bank_account_id, :bank_name, :bank_last4, :address_line1, :address_line2, :address_city, :address_state, :address_zip, :address_country)
  end
end