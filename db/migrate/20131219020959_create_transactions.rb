class CreateTransactions < ActiveRecord::Migration
  def change
    create_table :financial_transactions, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.uuid :product_id,        null: false
      t.hstore  :details,        null: false

      t.timestamps
    end
  end
end
