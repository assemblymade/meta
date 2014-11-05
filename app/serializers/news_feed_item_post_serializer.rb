class NewsFeedItemPostSerializer < ApplicationSerializer
  include MarkdownHelper
  attributes :url, :title, :description

  def url
    object.try(:url) || product_path(object.news_feed_items.first.product)
  end

  def description
    product_markdown(object.news_feed_items.first.product, object.description)
  end
end
