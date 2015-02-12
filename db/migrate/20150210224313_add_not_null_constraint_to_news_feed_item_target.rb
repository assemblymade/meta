class AddNotNullConstraintToNewsFeedItemTarget < ActiveRecord::Migration
  def change
    NewsFeedItem.unscoped.where(target_id: nil).delete_all

    change_column :news_feed_items, :target_id, :uuid, null: false
  end
end
