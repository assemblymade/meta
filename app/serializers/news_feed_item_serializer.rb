class NewsFeedItemSerializer < ApplicationSerializer
  attributes :url, :popular_at, :layout, :last_comment

  has_one :product
  has_one :target
  has_one :user

  def last_comment
    NewsFeedItemCommentSerializer.new(object.news_feed_item_comments.order(created_at: :asc).first)
  end

  def layout
    object.target_type
  end

  def product
    Product.find(object.product_id)
  end

  def target
    object.target_type.try(:constantize).try(:find, object.target_id)
  end

  def url
    product_update_path(product, object)
  end

  def user
    User.find(object.source_id)
  end
end
