class AddCommentsCountToNewsFeedItems < ActiveRecord::Migration
  def up
    add_column :news_feed_items, :comments_count, :integer, default: 0

    NewsFeedItem.find_each do |item|
      NewsFeedItem.reset_counters(item.id, :comments)
    end
  end

  def down
    remove_column :news_feed_items, :comments_count
  end
end
