class AddArchivedAtToNewsFeedItems < ActiveRecord::Migration
  def change
    add_column :news_feed_items, :archived_at, :datetime
  end
end
