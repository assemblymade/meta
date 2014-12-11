class AddWatchingsCountToNewsFeedItems < ActiveRecord::Migration
  def change
    add_column :news_feed_items, :watchings_count, :integer
  end
end
