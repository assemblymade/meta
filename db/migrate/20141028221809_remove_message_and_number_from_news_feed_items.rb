class RemoveMessageAndNumberFromNewsFeedItems < ActiveRecord::Migration
  def change
    remove_column :news_feed_items, :message
    remove_column :news_feed_items, :number
  end
end
