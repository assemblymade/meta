class NewsFeedItemPost < ActiveRecord::Base
  has_one :news_feed_item, as: :target
  belongs_to :product
  
  def url_params
    [product, self]
  end
end
