class TweetWorker
  include Sidekiq::Worker

  def perform(text)
    Tweeter.new.tweet_general(text)
  end

end
