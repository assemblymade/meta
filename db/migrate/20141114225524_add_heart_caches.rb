class AddHeartCaches < ActiveRecord::Migration
  def change
    add_column :news_feed_items, :hearts_count, :integer, null: false, default: 0
    add_column :news_feed_item_comments, :hearts_count, :integer, null: false, default: 0
  end
end
