class ActivityAnalyticsSerializer < ActiveModel::Serializer
  attributes :product_id, :product_slug
  attributes :verb, :verb_subject, :verb_and_subject

  def product_id
    product.try(:id)
  end

  def product_slug
    product.try(:slug)
  end

  def product
    @product ||= object.subject.try(:product)
  end

  def user_type
    product.core_team?(actor) ? "Core" : "User"
  end

  def verb_and_subject
    "#{verb}.#{verb_subject}"
  end
end
