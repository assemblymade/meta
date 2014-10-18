class NewsFeedItemSerializer < ApplicationSerializer
  attributes :message

  has_one :product
  has_one :target
  has_one :user
  has_many :news_feed_item_comments

  def message
    object.message
  end

  def product
    Product.find(object.product_id)
  end

  def target
    object.target_type.try(:constantize).try(:find, object.target_id)
  end

  def user
    User.find(object.source_id)
  end
end
