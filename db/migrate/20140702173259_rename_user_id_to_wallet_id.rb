class RenameUserIdToWalletId < ActiveRecord::Migration
  def change
    rename_column :transaction_log_entries, :user_id, :wallet_id
  end
end
