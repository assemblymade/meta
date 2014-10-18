class NewsFeedItemComment < ActiveRecord::Base
  belongs_to :news_feed_item
end
