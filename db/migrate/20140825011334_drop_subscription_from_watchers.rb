class DropSubscriptionFromWatchers < ActiveRecord::Migration
  def change
    remove_column :watchings, :subscription
  end
end
