class AddIndexesToNewsFeedItemComments < ActiveRecord::Migration
  def change
    add_index :news_feed_item_comments, :news_feed_item_id
    add_index :news_feed_item_comments, :user_id
    add_index :news_feed_item_comments, :created_at
    add_index :news_feed_item_comments, :deleted_at
    add_index :news_feed_item_comments, :target_id
  end
end
