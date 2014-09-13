class AddIndexToActivitiesStoryId < ActiveRecord::Migration
  def change
    add_index :activities, :story_id
  end
end
