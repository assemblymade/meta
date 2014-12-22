namespace :platform_metrics do
  desc "Calculates and stores comment responsiveness"
  task :calculate_comment_responsiveness => :environment do
    # calculates commment response time for each product
    # this creates a new ProductMetric record for each product
    Product.all.map(&:calc_task_comments_response_time)
    PlatformMetric.create(
      mean_product_responsiveness: ProductMetric.overflow_safe_mean_comment_responsiveness,
      median_product_responsiveness: ProductMetric.median_comment_responsiveness,
      calculated_at: Time.now
    )
  end
end
