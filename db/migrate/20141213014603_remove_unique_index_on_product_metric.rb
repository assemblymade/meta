class RemoveUniqueIndexOnProductMetric < ActiveRecord::Migration
  def change
    remove_index :product_metrics, :product_id
    add_index :product_metrics, :product_id
  end
end
