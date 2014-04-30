class CreateWatchings < ActiveRecord::Migration
  def change
    create_table :watchings, id: false do |t|
      t.primary_key :id, :uuid,   default: nil

      t.uuid   :user_id,        null: false
      t.uuid   :watchable_id,   null: false
      t.string :watchable_type, null: false

      t.index [:watchable_id, :user_id], unique: true

      t.timestamps
    end
  end
end
