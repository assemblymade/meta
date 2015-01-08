class AddForeignKeysToComments < ActiveRecord::Migration
  def change
    NewsFeedItemComment.find_each{|c| c.destroy if c.news_feed_item.nil? }

    add_foreign_key :news_feed_item_comments, :news_feed_items
  end
end
