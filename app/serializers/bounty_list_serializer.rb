class BountyListSerializer < ApplicationSerializer
  include MarkdownHelper

  attributes :closed_at,
             :comments_count,
             :earnable_coins_cache,
             :news_feed_item_id,
             :number,
             :priority,
             :product_slug,
             :title,
             :url

  has_one :locker
  has_one :user

  has_many :tags

  def url
    product_wip_path(object.product, object)
  end

  def locker
    User.find_by(id: object.locked_by)
  end

  def product_slug
    object.product.slug
  end

  def news_feed_item_id
    object.news_feed_item && object.news_feed_item.id
  end
end
