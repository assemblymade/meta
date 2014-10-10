class ActivityAnalyticsSerializer < ActiveModel::Serializer
  attributes :product_id, :product_slug
  attributes :verb, :verb_subject

  def product_id
    product.id
  end

  def product_slug
    product.slug
  end

  def product
    @product ||= object.subject.product
  end

  def user_type
    product.core_team?(actor) ? "Core" : "User"
  end
end

