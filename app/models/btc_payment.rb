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

end
