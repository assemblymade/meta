class RenameAsmlyticsUntrackedAccountsToTotalVisitors < ActiveRecord::Migration
  def change
    rename_column :products, :asmlytics_untracked_accounts, :total_visitors
  end
end
