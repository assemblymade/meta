class DashboardSerializer < ApplicationSerializer
  attributes :filter, :marks, :initial_interests

  has_many :followed_products,
    serializer: ProductShallowSerializer

  has_many :heartables

  has_many :news_feed_items

  has_many :user_hearts

  has_many :user_locked_bounties,
    serializer: BountyShallowSerializer

  has_many :user_reviewing_bounties,
    serializer: BountyShallowSerializer

  has_one :current_product

  has_many :recent_products
end
