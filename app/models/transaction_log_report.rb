require 'csv'

class TransactionLogReport
  def initialize(product)
    @product = product
  end

  def to_csv
    Rails.cache.fetch([@product, :transaction_log], expires_in: 24.hours) do
      @entries = TransactionLogEntry.where(product_id: @product.id).order(:created_at).to_a
      CSV.generate do |csv|
        csv << ["Time", "Action", "Work", "Author", "Value"]
        @entries.each do |entry|
          csv << [entry.created_at.iso8601, entry.work_id, entry.user_id, entry.action, entry.value]
        end
      end
    end
  end
end