class WipAnalyticsSerializer < ProductAnalyticsSerializer
  attributes :wip_id, :wip_number
  attributes :discussion_type

  def product_id
    product.id
  end

  def product_slug
    product.slug
  end

  def wip_id
    wip.id
  end

  def wip_number
    wip.number
  end

  def discussion_type
    wip.type
  end

  # private

  def product
    @product ||= object.product
  end

  def wip
    @wip ||= object
  end
end
