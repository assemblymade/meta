class NewsFeedItemSerializer < ApplicationSerializer
  attributes :url, :archived_at, :popular_at, :layout, :comments_count

  attributes :heartable_type, :hearts_count

  has_one :product
  has_one :target
  has_one :user
  has_one :last_comment

  def comments_count
    object.target.try(:comments_count) || object.comments_count
  end

  def layout
    object.target_type
  end

  def url
    product_update_path(product, object)
  end

  def user
    object.source
  end

  def heartable_type
    'NewsFeedItem'
  end
end
