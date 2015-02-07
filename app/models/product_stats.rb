class ProductStats

  DEFAULT_RANGE = 7.days
  DEFAULT_GROWTH_INTERVAL = 7.days
  PRODUCTS_ELIGIBLE_TO_BE_HOT = 25

  def self.top_products_by_activity(time: Time.now, range: DEFAULT_RANGE, limit: 20)
    Activity.joins(:product)
            .group('products.slug')
            .where('activities.created_at >= ?', time-range)
            .where('activities.created_at < ?', time)
            .count
            .sort{|x, y| y[1] <=> x[1]}
            .take(limit)
  end

  def self.growth_on_product(product, time: Time.now, range: DEFAULT_RANGE, growth_interval: DEFAULT_GROWTH_INTERVAL)

    activities =  Activity.joins(:product).where('products.name = ?', product.name)
    start = activities.where('activities.created_at >= ?', time - range - growth_interval).where('activities.created_at < ?', time - growth_interval).count
    end_time = activities.where('activities.created_at >= ?', time - range).where('activities.created_at < ?', time).count

    if start > 10
      [(end_time - start).to_f / start.to_f * 100 , (end_time - start).to_f]
    else
      [1000.to_f, (end_time-start).to_f ]
    end
  end

  def self.hottest_products
    top_products = self.top_products_by_activity(limit: PRODUCTS_ELIGIBLE_TO_BE_HOT).select{|a, b| a!="meta"}.map{|a, b| a}
    a= top_products.map{|a| [a, self.growth_on_product(Product.find_by(slug: a)) ]}
    growthlist = a.sort_by{|a, b| -b[1]}  #sorting by absolute growth no proportional
  end

  def self.hearts_since(time)
    Heart.where('created_at > ?', time).group(:heartable_type).group(:heartable_id).count.sort_by{|k, v| -v}
  end

  def self.most_loved(top_n, time)
    #news feed items only
    self.hearts_since(time).select{|a, b| a[0] == "NewsFeedItem"}.take(top_n).map{|a, b| NewsFeedItem.find(a[1])}
  end

end
