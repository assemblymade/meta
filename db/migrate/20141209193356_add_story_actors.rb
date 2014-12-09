class AddStoryActors < ActiveRecord::Migration
  def change
    create_table :story_actors, id: :uuid do |t|
      t.uuid :story_id, null: false
      t.uuid :user_id,  null: false
      t.datetime :created_at, null: false

      t.index [:story_id, :user_id], unique: true
    end

    Story.includes(:activities).find_each do |story|
      if activity = story.activities.first
        StoryActor.create!(story_id: story.id, user_id: activity.actor_id)
      end
    end
  end
end
