class NewsFeedItemComment < ActiveRecord::Base
  belongs_to :news_feed_item, touch: :last_commented_at
  belongs_to :user

  has_many :hearts, as: :heartable

  def self.publish_to_news_feed(target, event, body)
    if news_feed_item = NewsFeedItem.find_by(target: target)
      create!(
        body: body,
        target_id: event.id,
        news_feed_item: news_feed_item,
        user: event.user
      )
    end
  end

  def product
    news_feed_item.product
  end

  def author_id
    user_id
  end

  def url_params
    [news_feed_item.url_params, anchor: id]
  end
end
