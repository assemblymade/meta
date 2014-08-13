class UserAnalyticsSerializer < ActiveModel::Serializer
  attributes :created_at, :email, :location, :customer_id, :last_sign_in_at, :facebook_uid

  attributes :comments
  attributes :ideas
  attributes :wips

  def comments
    Event::Comment.where(user: object).size
  end

  def ideas
    object.products.size
  end

  def wips
    object.wips.size
  end
end
