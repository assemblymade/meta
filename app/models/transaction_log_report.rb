require 'csv'

class TransactionLogReport
  def initialize(product)
    @product = product
  end

  def to_csv
    Rails.cache.fetch([@product, :transaction_log], expires_in: 24.hours) do
      @entries = TransactionLogEntry.where(product_id: @product.id).order(:created_at)
      users = Hash[User.where(id: @entries.pluck(:wallet_id).uniq).pluck(:id, :username)]

      CSV.generate do |csv|
        csv << ["Time", "Work", "Wallet", "User", "Action", "Value"]
        @entries.each do |entry|
          username = users[entry.wallet_id]
          csv << [entry.created_at.iso8601, entry.work_id, entry.wallet_id, username, entry.action, entry.cents]
        end
      end
    end
  end
end
