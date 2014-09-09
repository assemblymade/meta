class AsmMetrics
  def self.product_enhancement
    AsmMetricsWorker.enqueue 'product.enhancement', 1
  end

  def self.active_user(user)
    AsmTrackUniqueWorker.enqueue 'user.active', user.id
  end

  def self.active_builder(user)
    AsmTrackUniqueWorker.enqueue 'user.builder.active', user.id
  end
end
