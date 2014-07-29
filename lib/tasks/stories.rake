namespace :stories do

  desc "Republish stories to redis"
  task :republish => :environment do
    Story.includes(activities: :subject).find_each do |story|
      puts "story: #{story.id}"
      begin
        publish_activity = PublishActivity.new
        publish_activity.push_to_feeds!(story)
        publish_activity.register_with_readraptor!(story)
      rescue => e
        puts "error: #{e}"
        puts "story: #{story.inspect}"
        raise
      end
    end
  end

  desc "Rebuild stories in database"
  task :rebuild => :environment do
    Story.delete_all
    Activity.where('created_at > ?', 7.days.ago).
             where(type: Activities::Comment).includes(:actor, :subject, :target).find_each do |activity|

      Story.create!(
        created_at: activity.created_at,
        updated_at: activity.created_at,
        verb: activity.verb,
        subject_type: activity.verb_subject,
      ).tap do |story|
        activity.update_attributes story_id: story.id
      end
    end
  end
end
