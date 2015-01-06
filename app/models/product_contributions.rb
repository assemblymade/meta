class ProductContributions
  attr_reader :product

  def initialize(product)
    @product = product
  end

  def total
    event_contributions = Event.joins(:wip).where('wips.product_id = ?', product.id).group(:product_id).count.values.first
    work_contributions = Work.where(product_id: product.id).group(:product_id).count.values.first
    event_contributions + (work_contributions || 0)
  end

  def uniques
    event_creators = Event.joins(:wip).
      where('wips.product_id = ?', product.id).
      group('events.user_id').count.keys

    wip_creators = Wip.
      where(product_id: product.id).
      group('wips.user_id').count.keys

    uniques = (event_creators | wip_creators).size
  end
end
