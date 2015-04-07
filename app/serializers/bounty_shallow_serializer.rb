class BountyShallowSerializer < ApplicationSerializer
  attributes :title, :comments_count, :hearts_count, :locked_at, :coins
  attributes :priority

  attributes :url

  has_one :locker

  has_one :product, serializer: ProductShallowSerializer

  has_one :user

  has_many :tags

  def comments_count
    object.news_feed_item.comments_count
  end

  def hearts_count
    object.news_feed_item.hearts_count
  end

  def coins
    object.value
  end

  def url
    product_wip_path(object.product, object)
  end
end
