class CreateProductTrends < ActiveRecord::Migration
  def change
    create_table :product_trends, id: :uuid do |t|
      t.uuid    :product_id
      t.decimal :score

      t.index :product_id, unique: true

      t.timestamps
    end
  end
end
