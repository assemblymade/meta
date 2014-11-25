class RemoveStartupWeekendFromProducts < ActiveRecord::Migration
  def change
    remove_column :products, :startup_weekend
  end
end
