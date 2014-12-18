class CreatePlatformMetrics < ActiveRecord::Migration
  def change
    create_table :platform_metrics, id: :uuid  do |t|
      t.float :mean_product_responsiveness
      t.float :median_product_responsiveness
      t.datetime :calculated_at

      t.timestamps
    end
  end
end
