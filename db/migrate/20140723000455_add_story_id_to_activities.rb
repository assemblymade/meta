class AddStoryIdToActivities < ActiveRecord::Migration
  def change
    add_column :activities, :story_id, :uuid
  end
end
