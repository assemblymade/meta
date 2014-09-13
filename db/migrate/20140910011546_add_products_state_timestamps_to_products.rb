class AddProductsStateTimestampsToProducts < ActiveRecord::Migration
  def change
    add_column :products, :started_teambuilding_at, :datetime
    add_column :products, :profitable_at, :datetime

    add_index :products, :started_teambuilding_at
    add_index :products, :profitable_at

    Product.all.each do |product|
      if product.partners.count >= 8
        product.update(greenlit_at: Time.now, started_teambuilding_at: Time.now)
      end

      if ['coderwall', 'helpful', 'really-good-emails'].include?(product.slug)
        product.update(profitable_at: Time.now, greenlit_at: Time.now, started_teambuilding_at: Time.now)
      end
    end
  end
end
