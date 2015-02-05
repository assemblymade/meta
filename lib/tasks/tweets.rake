namespace :tweeter do
  task :tweet_new_ideas => :environment do
    Idea.where(last_tweeted_at: nil).each do |a|
      time_difference = Time.now - a.created_at

      if time_difference >= 24*3600
        Tweeter.new.tweet_idea(a)
      end
    end
  end
end
