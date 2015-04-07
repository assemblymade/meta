class Admin::BitcoinController < AdminController

  require 'csv'

  def index
    @payment_btc_sum = BtcPayment.sum(:btc_change)
    payments_n = BtcPayment.count
    @payments = BtcPayment.where('btc_change*btc_change > 1000000000000').order("created_at desc").last(50)

    @total_btc_paid_to_users = BtcPayment.where(action: "Paid User").sum(:btc_change).to_f / 100000000 * -1

    sum = 0
    BtcPayment.where(action: "Paid User").each do |b|
      sum = sum + b.btcusdprice_at_moment * b.btc_change * -1
    end
    @total_cash_value_of_btc_to_users = sum.to_f / 100 / 100000000
  end

  def generate_csv(data)
    respond_to do |format|
      format.html
      format.csv { send_data data.as_csv }
    end
  end

  def show_payments_as_csv
    generate_csv(BtcPayment.all)
  end

  def show
    show_payments_as_csv
  end

  def report
    show_payments_as_csv
  end


end
