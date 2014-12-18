class AddTargetIdToNfiComments < ActiveRecord::Migration
  def change
    add_column :news_feed_item_comments, :target_id, :uuid

    NewsFeedItemComment.joins(:news_feed_item).where('news_feed_items.target_type = ?', Wip).delete_all

    Wip.joins(:news_feed_item).includes(:news_feed_item, :comments).find_each do |wip|
      nfi = wip.news_feed_item

      wip.comments.each do |comment|
        nfi.comments.create(
          news_feed_item: nfi,
          target_id: comment.id,
          body: comment.body,
          user_id: comment.user.id,
          created_at: comment.created_at,
          updated_at: comment.updated_at
        )
      end
    end

  end
end
