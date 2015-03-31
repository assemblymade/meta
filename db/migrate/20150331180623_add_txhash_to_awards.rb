class AddTxhashToAwards < ActiveRecord::Migration
  def change
    add_column :awards, :transaction_hash, :string
  end
end
