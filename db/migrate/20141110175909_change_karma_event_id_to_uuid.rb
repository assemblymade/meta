class ChangeKarmaEventIdToUuid < ActiveRecord::Migration
  def change
    remove_column :deeds, :karma_event_id
    change_table :deeds do |t|
      t.uuid :karma_event_id
    end
  end
end
