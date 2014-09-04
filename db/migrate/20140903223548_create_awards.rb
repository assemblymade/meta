class CreateAwards < ActiveRecord::Migration
  def change
    create_table :awards, id: :uuid do |t|
      t.uuid :awarder_id
      t.uuid :event_id
      t.uuid :wip_id
      t.uuid :winner_id
      t.integer :cents

      t.timestamps
    end
  end
end
