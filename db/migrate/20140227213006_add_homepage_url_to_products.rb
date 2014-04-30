class AddHomepageUrlToProducts < ActiveRecord::Migration
  def change
    add_column :products, :homepage_url, :string
    Product.where(slug: 'readraptor').update_all(:homepage_url => 'https://readraptor.com')
    Product.where(slug: 'helpful').update_all(:homepage_url => 'https://helpful.io')
  end
end
