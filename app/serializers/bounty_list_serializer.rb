class BountyListSerializer < ApplicationSerializer
  include MarkdownHelper

  attributes :closed_at, :earnable_coins_cache,
    :news_feed_item_id, :comments_count, :number,
    :priority, :product_slug, :title, :url,
    :hearts_count, :value

  has_one :locker
  has_one :user

  has_many :tags

  def comments_count
    object.news_feed_item &&
      object.news_feed_item.comments_count
  end

  def hearts_count
    object.news_feed_item &&
      object.news_feed_item.hearts_count
  end

  def url
    product_wip_path(object.product, object)
  end

  def product_slug
    object.product.slug
  end

  def news_feed_item_id
    object.news_feed_item && object.news_feed_item.id
  end

  def value
    object[:value]
  end
end
