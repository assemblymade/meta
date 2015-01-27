class AddIndexToTransactionLogEntriesOnCents < ActiveRecord::Migration
  def change
    add_index :transaction_log_entries, [:wallet_id, :product_id, :cents], name: 'transaction_log_entries_index_for_dashboard'
  end
end
