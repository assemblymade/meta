class AddPopularAtToNewsFeedItems < ActiveRecord::Migration
  def change
    add_column :news_feed_items, :popular_at, :datetime
  end
end
  