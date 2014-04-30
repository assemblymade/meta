class CreateActivities < ActiveRecord::Migration
  def change
    enable_extension "hstore"

    create_table :activities, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.uuid   :owner_id,     null: false

      t.uuid   :subject_id,   null: false
      t.string :subject_type, null: false

      t.string  :key,         null: false
      t.hstore  :parameters
      t.timestamps
    end
  end
end
