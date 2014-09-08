class CreateChatRooms < ActiveRecord::Migration
  def change
    create_table :chat_rooms, id: :uuid do |t|
      t.string :slug,     null: false
      t.uuid :wip_id
      t.uuid :product_id
      t.datetime :deleted_at
      t.timestamps

      t.index :slug, unique: true
    end
  end
end
