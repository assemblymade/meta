class CreateNewsFeedItemPosts < ActiveRecord::Migration
  def change
    create_table :news_feed_item_posts, id: :uuid do |t|
      t.uuid :news_feed_item_id
      t.text :title
      t.text :description
      t.timestamps
    end
  end
end
