class AddCentsToTransactionLogEntries < ActiveRecord::Migration
  def change
    add_column :transaction_log_entries, :cents, :integer

    TransactionLogEntry.where(action: ['minted', 'debit', 'credit']).each do |entry|
      entry.cents = (entry.value.to_d * 100).to_i
      entry.save!
    end
  end
end
