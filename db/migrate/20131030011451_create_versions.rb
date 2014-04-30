class CreateVersions < ActiveRecord::Migration
  def change
    create_table :versions, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.uuid   :versioned_id,   null: false
      t.string :versioned_type, null: false
      t.uuid :user_id,          null: false

      t.text    :modifications, null: false
      t.integer :number,        null: false

      t.timestamps
    end
  end
end
