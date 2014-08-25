class DropWatchingsCountFromWips < ActiveRecord::Migration
  def up
    remove_column :wips, :watchings_count

    Product.find_each do |product|
      product.update_watchings_count!
    end
  end
end
