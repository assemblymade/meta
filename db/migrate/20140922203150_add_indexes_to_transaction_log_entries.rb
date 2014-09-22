class AddIndexesToTransactionLogEntries < ActiveRecord::Migration
  def change
    add_index :transaction_log_entries, :wallet_id
  end
end
