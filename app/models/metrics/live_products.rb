module Metrics
  class LiveProducts < KPI
    def between(start_at, end_at)
      product_ids = [MonthlyMetric, WeeklyMetric].map do |k|
        k.unscoped.where('date >= ? and date < ?', start_at, end_at).group(:product_id).count.keys
      end.flatten.uniq

      RawNumber.new(product_ids.size)
    end
  end
end
