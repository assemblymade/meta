class NewsFeedItemPost < ActiveRecord::Base
  has_many :news_feed_items, as: :target
end
