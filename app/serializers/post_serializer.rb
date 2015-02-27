class PostSerializer < ApplicationSerializer
  include MarkdownHelper
  include TruncateHtmlHelper

  attributes :body, :summary
  attributes :markdown_body, :url, :summary, :title, :news_feed_item_id, :created_at
  attributes :comments_count, :hearts_count, :short_body

  has_one :product, serializer: ProductSerializer
  has_one :user

  has_many :marks

  def comments_count
    news_feed_item.comments.count
  end

  def hearts_count
    news_feed_item.hearts.count
  end

  def markdown_body
    product_markdown(object.product, object.body)
  end

  def body
    md = object.body
    html = product_markdown(object.product, md)
    text = Nokogiri::HTML(html).text
    {
      md:   object.body,
      html: html,
      text: text
    }
  end

  def news_feed_item
    object.news_feed_item
  end

  def news_feed_item_id
    news_feed_item.try(:id)
  end

  def short_body
    truncate_html(product_markdown(object.product, object.body), length: 200)
  end

  def url
    product_post_path(object.product, object)
  end

  def full_url
    product_post_url(object.product, object)
  end

  cached

  def cache_key
    [object]
  end
end
