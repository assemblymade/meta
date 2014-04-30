class AddIndexToCoinDays < ActiveRecord::Migration
  def change
    add_index :coin_days, [:product_id, :user_id, :date], unique: true
  end
end
