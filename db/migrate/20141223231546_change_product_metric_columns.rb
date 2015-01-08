class ChangeProductMetricColumns < ActiveRecord::Migration
  def change
    remove_column :product_metrics, :comment_responsiveness
    add_column :product_metrics, :noncore_responsiveness, :integer
    add_column :product_metrics, :response_times, :text
  end
end
