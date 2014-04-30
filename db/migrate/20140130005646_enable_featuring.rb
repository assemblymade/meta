class EnableFeaturing < ActiveRecord::Migration
  def change
    add_column :products, :featured_on, :datetime
    
    ['helpful', 'calmail'].each do |product_to_feature|
      product = Product.find_by(slug: product_to_feature)
      product.feature! if product
    end
  end
end
