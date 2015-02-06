namespace :tweeter do
  task :tweet_new_ideas => :environment do
    ONE_DAY = 24 * 60 * 60
    Idea.where(last_tweeted_at: nil).where('created_at < ?', Time.now.to_i - ONE_DAY).each do |a|
      Tweeter.new.tweet_idea(a)
    end
  end

  task :tweet_hot_products => :environment do

    today = Time.now.utc.wday
    if today == 2
      Tweeter.new.tweet_hot_products(4)
    end
  end

end
