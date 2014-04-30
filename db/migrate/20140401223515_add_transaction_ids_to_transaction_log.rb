class AddTransactionIdsToTransactionLog < ActiveRecord::Migration
  def change
    add_column :transaction_log_entries, :transaction_id, :uuid
    add_column :transaction_log_entries, :extra, :hstore
  end
end
