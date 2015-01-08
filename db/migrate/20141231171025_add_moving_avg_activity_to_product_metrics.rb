class AddMovingAvgActivityToProductMetrics < ActiveRecord::Migration
  def change
    add_column :product_metrics, :trailing_month_activity, :integer
  end
end
