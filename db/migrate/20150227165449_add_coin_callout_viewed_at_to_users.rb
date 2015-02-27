class AddCoinCalloutViewedAtToUsers < ActiveRecord::Migration
  def change
    add_column :users, :coin_callout_viewed_at, :datetime
  end
end
