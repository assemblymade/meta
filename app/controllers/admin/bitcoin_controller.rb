class Admin::BitcoinController < AdminController

  def index
    @payment_btc_sum = BtcPayment.sum(:btc_change)
  end

end
