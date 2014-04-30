class AddWatchingCounterToProducts < ActiveRecord::Migration
  def change
    add_column :products, :watchings_count, :integer, null: false, default: 0

    Product.find_each do |product|
      Product.reset_counters(product.id, :watchings)
    end
  end
end
