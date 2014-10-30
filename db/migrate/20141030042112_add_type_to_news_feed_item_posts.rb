class AddTypeToNewsFeedItemPosts < ActiveRecord::Migration
  def change
    add_column :news_feed_item_posts, :type, :string
  end
end
