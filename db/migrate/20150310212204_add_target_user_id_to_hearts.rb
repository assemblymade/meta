class AddTargetUserIdToHearts < ActiveRecord::Migration
  def change
    add_column :hearts, :target_user_id, :uuid, null: true

    user_ids = NewsFeedItem.group(:source_id).count.keys | NewsFeedItemComment.group(:user_id).count.keys

    user_ids.each do |user_id|
      Heart.joins('inner join news_feed_items on news_feed_items.id = heartable_id').
            where(news_feed_items: { source_id: user_id }).
            update_all(target_user_id: user_id)

      Heart.joins('inner join news_feed_item_comments on news_feed_item_comments.id = heartable_id').
            where(news_feed_item_comments: { user_id: user_id }).
            update_all(target_user_id: user_id)

    end
  end
end
