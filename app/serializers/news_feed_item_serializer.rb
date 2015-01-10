class NewsFeedItemSerializer < ApplicationSerializer
  attributes :url, :archived_at, :popular_at, :layout, :last_comment, :comments_count

  attributes :heartable_id, :heartable_type, :hearts_count

  has_one :product, serializer: ProductSerializer
  has_one :target
  has_one :user

  def comments_count
    object.target.try(:comments_count) || object.comments_count
  end

  def last_comment
    NewsFeedItemCommentSerializer.new(object.last_comment)
  end

  def layout
    object.target_type
  end

  def product
    Product.find(object.product_id) if object.try(:product_id)
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

  def heartable_id
    object.id
  end

  def heartable_type
    'NewsFeedItem'
  end
end
