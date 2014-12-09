class AddSubjectIdToStories < ActiveRecord::Migration
  def change
    add_column :stories, :subject_id, :uuid

    Story.includes(:activities).find_each do |story|
      if activity = story.activities.first
        story.update!(
          subject: activity.target_entity
        )
      else
        story.destroy
      end
    end

    change_column :stories, :subject_id, :uuid, null: false
  end
end
