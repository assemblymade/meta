class AddUrlToNewsFeedItemPosts < ActiveRecord::Migration
  def change
    add_column :news_feed_item_posts, :url, :text
  end
end
