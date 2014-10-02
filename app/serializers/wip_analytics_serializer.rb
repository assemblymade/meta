class WipAnalyticsSerializer < ProductAnalyticsSerializer
  attributes :wip_id, :wip_number
  attributes :wip_votes_count, :wip_comments_count
  attributes :wip_type
  attributes :featured

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

  def wip_votes_count
    wip.votes_count
  end

  def wip_comments_count
    wip.comments_count
  end

  def wip_type
    wip.type
  end

  def featured
    wip.featured?
  end

  # private

  def product
    @product ||= object.product
  end

  def wip
    @wip ||= object
  end
end
