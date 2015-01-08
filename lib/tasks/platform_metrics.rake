namespace :platform_metrics do
  desc "Calculates and stores product responsiveness"
  task :calculate_product_responsiveness => :environment do
    # calculates responsiveness for each product
    # this creates a new ProductMetric record for each product
    Product.all.each do |p|
      ProductMetric.record_new(product: p)
    end

    PlatformMetric.create(
      mean_core_responsiveness: ProductMetric.overflow_safe_weighted_average(:core_responsiveness),
      median_core_responsiveness: ProductMetric.median(:core_responsiveness),
      mean_noncore_responsiveness: ProductMetric.overflow_safe_weighted_average(:noncore_responsiveness),
      median_noncore_responsiveness: ProductMetric.median(:noncore_responsiveness),
      calculated_at: Time.now
    )
  end

  task :historical_responsiveness => :environment do

    old_level = ActiveRecord::Base.logger.level
    ActiveRecord::Base.logger.level = 2 # don't log debug or info

    ending = Time.now
    start = Time.now - 2.months

    while((start += 1.day) < ending)
      products = Product.where('created_at < ?', start)
      puts "#{start.strftime('%m %d %Y')} - #{products.count} products \n\n"
      products.each_with_index do |p, index|
        puts "#{p.slug} - #{((index+1)*100/products.count.to_f).round(2)}%"
        ProductMetric.record_new(product: p, time: start)
      end

      PlatformMetric.create(
        mean_core_responsiveness: ProductMetric.overflow_safe_weighted_average(:core_responsiveness),
        median_core_responsiveness: ProductMetric.median(:core_responsiveness),
        mean_noncore_responsiveness: ProductMetric.overflow_safe_weighted_average(:noncore_responsiveness),
        median_noncore_responsiveness: ProductMetric.median(:noncore_responsiveness),
        calculated_at: start
      )
    end
    ActiveRecord::Base.logger.level = old_level
  end
end
