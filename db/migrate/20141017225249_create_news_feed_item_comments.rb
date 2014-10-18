class CreateNewsFeedItemComments < ActiveRecord::Migration
  def change
    create_table :news_feed_item_comments, id: :uuid do |t|
      t.uuid :news_feed_item_id
      t.uuid :user_id
      t.string :body

      t.datetime :created_at
      t.datetime :updated_at
      t.datetime :deleted_at
    end
  end
end
