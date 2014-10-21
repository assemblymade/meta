class NewsFeedItemSerializer < ApplicationSerializer
  attributes :logo_url, :message, :url

  has_one :product
  has_one :target
  has_one :user
  has_many :news_feed_item_comments, serializer: NewsFeedItemCommentSerializer

  def logo_url
    image_url = if product.logo.present?
      product.logo.url
    elsif product.poster.present?
      product.poster_image.url
    else
      '/assets/app_icon.png'
    end
  end

  def message
    object.message
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
