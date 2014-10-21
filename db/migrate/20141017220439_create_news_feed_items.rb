class CreateNewsFeedItems < ActiveRecord::Migration
  def change
    create_table :news_feed_items, id: :uuid do |t|
      t.uuid     :source_id
      t.string   :message
      t.uuid     :product_id
      t.uuid     :target_id
      t.string   :target_type
      t.integer  :number
      t.datetime :created_at
      t.datetime :updated_at
      t.datetime :deleted_at
    end
  end
end
