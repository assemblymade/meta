class PostSerializer < ApplicationSerializer
  include MarkdownHelper
  include TruncateHtmlHelper

  attributes :markdown_body, :url, :summary, :title, :news_feed_item_id, :created_at, :deleted_at
  attributes :comments_count, :hearts_count, :short_body

  has_one :user

  has_many :marks

  def comments_count
    news_feed_item.comments.count
  end

  def hearts_count
    news_feed_item.hearts.count
  end

  def product
    object.product
  end

  def markdown_body
    product_markdown(product, object.body)
  end

  def news_feed_item
    object.news_feed_item
  end

  def news_feed_item_id
    news_feed_item.try(:id)
  end

  def short_body
    truncate_html(product_markdown(product, object.body), length: 200)
  end

  def url
    product_post_path(product, object)
  end

  cached

  def cache_key
    [object]
  end
end
