class NewsFeedItemPostSerializer < ApplicationSerializer
  attributes :url, :title, :description

  def url
    product_path(object.news_feed_items.first.product)
  end
end
