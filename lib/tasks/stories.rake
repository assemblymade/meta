namespace :stories do

  desc "Republish stories to redis"
  task :republish => :environment do
    NewsFeed.delete_all
    Story.includes(:subject, :story_actors).find_each do |story|
      puts "story: #{story.id} #{story.verb.rjust(15)} #{story.subject_type}"

      (story.subject.product.follower_ids - story.actor_ids).each do |user_id|
        NewsFeed.new(User, user_id).push(story)
      end
    end
  end
end
