class PostSerializer < ApplicationSerializer
  include MarkdownHelper

  attributes :markdown_body, :url, :summary, :title, :news_feed_item_id, :created_at

  has_one :user

  def product
    object.product
  end

  def markdown_body
    product_markdown(product, object.body)
  end

  def news_feed_item_id
    NewsFeedItem.select(:id).find_by(target_id: object.id).try(:id)
  end

  def url
    product_post_path(product, object)
  end
end
