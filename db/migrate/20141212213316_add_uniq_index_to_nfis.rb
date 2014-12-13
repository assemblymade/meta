class AddUniqIndexToNfis < ActiveRecord::Migration
  def change
    add_index :news_feed_items, :target_id, unique: true
  end
end
