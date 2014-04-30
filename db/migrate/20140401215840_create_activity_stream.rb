class CreateActivityStream < ActiveRecord::Migration
  def change
    create_table :stream_events, id: :uuid do |t|
      t.uuid   :actor_id
      t.uuid   :product_id, null: true
      t.uuid   :subject_id, null: false
      t.string :subject_type, null: false
      t.uuid   :target_id
      t.string :target_type
      t.string :verb, null: false
      t.string :type, null: false
      t.boolean :product_flagged, default: false
      t.timestamps
    end
  end
end
