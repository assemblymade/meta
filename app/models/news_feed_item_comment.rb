class NewsFeedItemComment < ActiveRecord::Base
  belongs_to :news_feed_item

  def self.publish_to_news_feed(target, event, body)
    if news_feed_item = NewsFeedItem.find_by(target: target)
      create!(
        body: body.truncate(250),
        news_feed_item: news_feed_item,
        user_id: event.user.id
      )
    end
  end
end
