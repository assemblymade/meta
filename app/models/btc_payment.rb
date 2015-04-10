class BtcPayment < ActiveRecord::Base

  require 'csv'

  def self.as_csv
    CSV.generate do |csv|
      csv << column_names
      all.each do |item|
        csv << item.attributes.values_at(*column_names)
      end
    end
  end

  def self.payments_before_date(date)
    BtcPayment.where('created_at < ?', date)
  end

  def self.create_entry(destination, public_address, float_amount)
    self.create!({
      btcusdprice_at_moment: OpenAssets::Transaction.new.get_btc_spot_price_coinbase()*100,
      created_at: DateTime.now,
      action: "Sent BTC",
      sender: "Assembly Central",
      recipient: destination,
      sender_address: public_address,
      recipient_address: destination,
      btc_change: amount*-100000000})
  end



end
