namespace :stories do

  desc "Republish stories to redis"
  task :republish => :environment do
    NewsFeed.delete_all
    Story.includes(:actors, :activities).find_each do |story|
      puts "story: #{story.id} #{story.verb.rjust(15)} #{story.subject_type}"

      story.reader_ids.each do |user_id|
        NewsFeed.new(User, user_id).push(story)
      end
    end
  end

  desc "Remove stories with orphaned targets"
  task prune: :environment do
    count = 0
    Story.includes(:activities).find_each do |story|
      if story.activities.empty?
        puts "destroying: #{story.id}"
        story.destroy
        count += 1
      end
    end
    puts "destroyed #{count} stories"
  end

  desc "Regroup stories by actors"
  task regroup: :environment do
    RegroupStories.new.perform(1.day.ago)
  end
end
