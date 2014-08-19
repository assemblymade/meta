class FixWatchingsCount < ActiveRecord::Migration
  def change
    Product.find_each do |product|
      product.watchings_count = product.watchings.active.count
      product.save!
    end
  end
end
