class DropCoinDays < ActiveRecord::Migration
  def change
    drop_table :coin_days
  end
end
