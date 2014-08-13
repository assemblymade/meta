class ProductAnalyticsSerializer < ActiveModel::Serializer
  attributes :product_id, :product_slug
  attributes :registered_users, :team_members
  attributes :current_mission
  attributes :status_updated

  def current_mission
    product.current_mission.try(:id)
  end

  def product_id
    product.id
  end

  def product_slug
    product.slug
  end

  def registered_users
    team_members
  end

  def team_members
    product.watchings.count
  end

  def status_updated
    product.status_messages.exists?
  end

  def product
    object
  end
end
