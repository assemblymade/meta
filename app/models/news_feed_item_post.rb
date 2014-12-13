class NewsFeedItemPost < ActiveRecord::Base
  has_many :news_feed_items, as: :target

  def url_params
    [product, self]
  end
end
