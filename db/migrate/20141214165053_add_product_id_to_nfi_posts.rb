class AddProductIdToNfiPosts < ActiveRecord::Migration
  def change
    add_column :news_feed_item_posts, :product_id, :uuid
    NewsFeedItemPost.find_each{|p| p.update!(product_id: NewsFeedItem.find_by(target: p).product_id) }
    change_column :news_feed_item_posts, :product_id, :uuid, null: false
  end
end
