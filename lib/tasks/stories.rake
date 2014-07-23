namespace :stories do

  desc "Republish stories to redis"
  task :republish => :environment do
    Story.includes(activities: :subject).where('stories.created_at > ?', 2.weeks.ago).find_each do |story|
      begin
        PublishActivity.new.push_to_feeds!(story)
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
    Activity.where.not(type: Activities::Chat).includes(:actor, :subject, :target).find_each do |activity|
      Story.create!(
        verb: activity.verb,
        subject_type: activity.verb_subject,
      ).tap do |story|
        activity.update_attributes story_id: story.id
      end
    end
  end
end
