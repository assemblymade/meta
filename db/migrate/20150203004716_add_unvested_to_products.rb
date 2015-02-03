class AddUnvestedToProducts < ActiveRecord::Migration
  def change
    add_column :products, :total_coins, :integer, :default => 10_000_000
  end
end
