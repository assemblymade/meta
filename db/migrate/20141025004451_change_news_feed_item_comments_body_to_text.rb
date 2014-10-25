class ChangeNewsFeedItemCommentsBodyToText < ActiveRecord::Migration
  def change
    change_column :news_feed_item_comments, :body, :text
  end
end
