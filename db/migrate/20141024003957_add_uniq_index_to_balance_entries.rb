class AddUniqIndexToBalanceEntries < ActiveRecord::Migration
  def up
    User::BalanceEntry.destroy_all
    add_index :user_balance_entries, [:profit_report_id, :user_id], unique: true
  end
end
