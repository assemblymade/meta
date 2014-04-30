class CreateLikes < ActiveRecord::Migration
  def change
    create_table :likes, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.uuid :user_id
      t.uuid :feature_id

      t.datetime :created_at
    end
  end
end
