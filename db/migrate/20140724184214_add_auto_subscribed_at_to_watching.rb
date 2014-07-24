class AddAutoSubscribedAtToWatching < ActiveRecord::Migration
  def change
    add_column :watchings, :auto_subscribed_at, :datetime
  end
end
