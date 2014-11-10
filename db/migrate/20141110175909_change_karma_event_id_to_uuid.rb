class ChangeKarmaEventIdToUuid < ActiveRecord::Migration
  def change

    drop_table :deeds
    drop_table :chronicles

    create_table :deeds, id: :uuid do |t|
      t.uuid :user_id
      t.datetime :created_at
      t.integer :karma_value
      t.string :karma_event_type
      t.uuid :karma_event_id
      t.belongs_to :chronicle
    end


    create_table :chronicles, id: :uuid do |t|
      t.uuid :user_id
      t.timestamps
    end

  end
end
