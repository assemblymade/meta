class AddCommentsCountToProductMetric < ActiveRecord::Migration
  def change
    add_column :product_metrics, :comments_count, :integer, default: 0
  end
end
