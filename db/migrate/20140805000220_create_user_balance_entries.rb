class CreateUserBalanceEntries < ActiveRecord::Migration
  def change
    create_table :user_balance_entries, id: :uuid do |t|
      t.uuid :user_id,          null: false
      t.uuid :profit_report_id, null: false
      t.integer :coins,         null: false
      t.integer :earnings,      null: false
    end
  end
end

