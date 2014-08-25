class ProductAnalyticsSerializer < ActiveModel::Serializer
  attributes :product_id, :product_slug, :product_name
  attributes :registered_users, :team_members
  attributes :status_updated

  def product_id
    product.id
  end

  def product_slug
    product.slug
  end

  def product_name
    product.name
  end

  def registered_users
    team_members
  end

  def team_members
    product.watchings_count
  end

  def status_updated
    product.status_messages.exists?
  end

  def product
    object
  end
end
