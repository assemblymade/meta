namespace :product_metrics do
  desc "Update product metrics from redshift"
  task :update do
    UpdateProductMetrics.perform_async
  end
end
