class ProductStats
  def self.top_products_by_activity(time: Time.now, range: 30.days, limit: 20)
    Activity.joins(:product)
            .group('products.slug')
            .where('activities.created_at >= ?', time-range)
            .where('activities.created_at < ?', time)
            .count
            .sort{|x, y| y[1] <=> x[1]}
            .take(limit)
  end
end

