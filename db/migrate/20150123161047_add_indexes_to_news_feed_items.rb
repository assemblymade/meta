class AddIndexesToNewsFeedItems < ActiveRecord::Migration
  def change
    add_index :news_feed_items, [:product_id, :target_type, :archived_at, :last_commented_at], name: 'index_news_feed_items_for_dashboard'
    add_index :news_feed_items, :product_id
    add_index :news_feed_items, [:target_id, :target_type]
  end
end
