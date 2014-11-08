class Admin::BitcoinController < AdminController

  def index
    @payment_btc_sum = BtcPayment.sum(:btc_change)
    payments_n = BtcPayment.count
    @payments = BtcPayment.last(50)
  end

end
