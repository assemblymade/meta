class UserAnalyticsSerializer < ActiveModel::Serializer
  attributes :created_at, :email, :location, :customer_id, :last_sign_in_at, :facebook_uid

  attributes :comments
  attributes :ideas
  attributes :product_upvotes
  attributes :wips
  attributes :wip_upvotes

  def comments
    Event::Comment.where(user: object).size
  end

  def ideas
    object.products.size
  end

  def product_upvotes
    Vote.where(voteable_type: 'Product').where(user: object).count
  end

  def wips
    object.wips.size
  end

  def wip_upvotes
    Vote.where(voteable_type: 'Wip').where(user: object).count
  end
end
