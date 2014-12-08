class AddLastCommentedAtToNewsFeedItems < ActiveRecord::Migration
  def change
    add_column :news_feed_items, :last_commented_at, :datetime

    NewsFeedItem.all.each do |item|
      if last_comment = item.comments.order(created_at: :desc).first
        item.update(last_commented_at: last_comment.created_at)
      else
        item.update(last_commented_at: item.created_at)
      end
    end
  end
end
