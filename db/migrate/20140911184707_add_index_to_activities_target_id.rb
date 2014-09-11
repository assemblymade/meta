class AddIndexToActivitiesTargetId < ActiveRecord::Migration
  def change
    add_index :activities, :target_id
  end
end
