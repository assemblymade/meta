class NewsFeedItemSerializer < ApplicationSerializer
  attributes :message, :url

  has_one :product
  has_one :target
  has_one :user
  has_many :news_feed_item_comments, serializer: NewsFeedItemCommentSerializer

  def message
    object.message
  end

  def news_feed_item_comments
    object.news_feed_item_comments.order(created_at: :asc)
  end

  def product
    Product.find(object.product_id)
  end

  def target
    object.target_type.try(:constantize).try(:find, object.target_id)
  end

  def url
    product_activity_path(product, object)
  end

  def user
    User.find(object.source_id)
  end
end
