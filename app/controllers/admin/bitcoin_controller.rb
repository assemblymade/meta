class Admin::BitcoinController < AdminController

  def index
    @payments = BtcPayment.all
  end

end
