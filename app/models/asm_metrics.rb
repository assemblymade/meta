class AsmMetrics
  def self.product_enhancement
    AsmMetricsWorker.perform_async 'product.enhancement', 1
  end

  def self.active_user(user)
    AsmTrackUniqueWorker.perform_async 'user.active', user.id
  end

  def self.active_builder(user)
    AsmTrackUniqueWorker.perform_async 'user.builder.active', user.id
  end
end
