class UpdateIndexesOnNewsFeedItemComments < ActiveRecord::Migration
  def change
    remove_index :news_feed_item_comments, :created_at
    remove_index :news_feed_item_comments, :deleted_at
    remove_index :news_feed_item_comments, :news_feed_item_id
    remove_index :news_feed_item_comments, :target_id

    add_index :news_feed_item_comments, [:news_feed_item_id, :created_at], name: 'index_news_feed_item_comments_for_dashboard'
  end
end
