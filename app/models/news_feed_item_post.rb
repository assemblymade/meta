class NewsFeedItemPost < ActiveRecord::Base
  has_many :news_feed_items, as: :target

  def product
    news_feed_items.first.product
  end

  def url_params
    [product, self]
  end
end
