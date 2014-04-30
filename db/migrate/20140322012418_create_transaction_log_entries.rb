class CreateTransactionLogEntries < ActiveRecord::Migration
  def change
    create_table :transaction_log_entries, id: :uuid do |t|
      t.uuid     :product_id, null: false
      t.uuid     :work_id,    null: false
      t.uuid     :user_id,    null: false
      t.string   :action,     null: false
      t.text     :value
      t.datetime :created_at
    end
  end
end
