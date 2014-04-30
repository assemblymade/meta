class CreateAmounts < ActiveRecord::Migration
  def change
    create_table :financial_amounts, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.string  :type,           null: false
      t.uuid    :account_id,     null: false
      t.uuid    :transaction_id, null: false
      t.integer :amount,         null: false
    end
  end
end
