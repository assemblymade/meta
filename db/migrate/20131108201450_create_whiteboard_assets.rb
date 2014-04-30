class CreateWhiteboardAssets < ActiveRecord::Migration
  def change
    create_table :whiteboard_assets, id: false do |t|
      t.primary_key :id, :uuid, default: nil
      t.uuid        :event_id,   null: false
      t.string      :image_url,  null: false
      t.string      :format,     null: false
      t.integer     :height,     null: false
      t.integer     :width,      null: false
      t.datetime    :created_at, null: false

      t.index       [:event_id, :image_url], unique: true
    end
  end
end
