class EventAnalyticsSerializer < WipAnalyticsSerializer
  attributes :event_id, :event_number

  def event_id
    object.id
  end

  def event_number
    object.number
  end

  def product
    @product ||= wip.product
  end

  def wip
    @wip ||= object.wip
  end
end
