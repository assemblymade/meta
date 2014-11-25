class AddStartupWeekendToProducts < ActiveRecord::Migration
  def change
    add_column :products, :startup_weekend, :boolean, default: false, null: false
    add_index :products, :startup_weekend
  end
end
