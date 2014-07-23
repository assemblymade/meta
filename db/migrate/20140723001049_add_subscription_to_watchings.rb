class AddSubscriptionToWatchings < ActiveRecord::Migration
  def change
    add_column :watchings, :subscription, :boolean, default: false
  end
end
