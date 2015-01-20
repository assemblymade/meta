class ProductAnalyticsSerializer < ActiveModel::Serializer
  attributes :product_id, :product_slug, :product_name
  attributes :registered_users, :team_members

  def product_id
    product.id if product
  end

  def product_slug
    product.slug if product
  end

  def product_name
    product.name if product
  end

  def registered_users
    team_members if product
  end

  def team_members
    product.watchings_count if product
  end

  def product
    object
  end
end
