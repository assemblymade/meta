class AddAsmlyticsUntrackedAccountsToProducts < ActiveRecord::Migration
  def change
    add_column :products, :asmlytics_untracked_accounts, :integer, default: 0, null: false
  end
end
