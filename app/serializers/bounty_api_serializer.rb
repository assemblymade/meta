class BountyApiSerializer < ApplicationSerializer
  attributes :comments_count, :coins, :description, :hearts_count, :locked_at, :number, :title

  has_one :locker, serializer: UserApiSerializer
  has_one :user, serializer: UserApiSerializer
  has_many :tags

  def comments_count
    news_feed_item.try(:comments_count) || 0
  end

  def hearts_count
    news_feed_item.try(:hearts_count) || 0
  end

  def coins
    object.value || 0
  end

  # private

  def news_feed_item
    object.news_feed_item
  end
end
