class AddBtcToProduct < ActiveRecord::Migration
  def change
    add_column :products, :last_checked_btc, :timestamp
    add_column :products, :issued_coins, :boolean

    change_table :transaction_log_entries do |t|
      t.string :queue_id
      t.string :transaction_hash
      t.boolean :success
      t.string :destination
      t.string :color_address
      t.integer :color_amount
      t.string :transaction_type
    end

  end
end
