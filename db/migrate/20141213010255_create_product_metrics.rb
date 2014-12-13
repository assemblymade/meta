class CreateProductMetrics < ActiveRecord::Migration
  def change
    create_table :product_metrics, id: :uuid do |t|
      t.uuid :product_id
      t.integer :comment_responsiveness
      t.index :product_id, unique: true

      t.timestamps
    end
  end
end
