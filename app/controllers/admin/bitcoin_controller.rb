class Admin::BitcoinController < AdminController

  def index
    @payment_btc_sum = BtcPayment.sum(:btc_change)
    payments_n = BtcPayment.count
    @payments = BtcPayment.last(50)
  end

  def liabilities
    @owed_users = Users.owed_money
  end

end
