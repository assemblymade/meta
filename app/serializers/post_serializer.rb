class PostSerializer < ApplicationSerializer
  include MarkdownHelper

  attributes :markdown_body, :url, :summary, :title, :news_feed_item_id, :created_at
  attributes :comments_count, :hearts_count

  has_one :user

  has_many :marks

  def comments_count
    news_feed_item.news_feed_item_comments.count
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
    unless news_feed_item.try(:id)
      raise object.inspect
    end
    news_feed_item.id
  end

  def url
    product_post_path(product, object)
  end

  cached

  def cache_key
    [object]
  end
end
