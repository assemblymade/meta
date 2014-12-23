class FixPlatformMetricColumns < ActiveRecord::Migration
  def change
    remove_column :platform_metrics, :mean_product_responsiveness
    remove_column :platform_metrics, :median_product_responsiveness
    add_column :platform_metrics, :mean_core_responsiveness, :integer
    add_column :platform_metrics, :median_core_responsiveness, :integer
    add_column :platform_metrics, :mean_noncore_responsiveness, :integer
    add_column :platform_metrics, :median_noncore_responsiveness, :integer
  end
end
