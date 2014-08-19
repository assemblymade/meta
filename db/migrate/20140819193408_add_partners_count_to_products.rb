class AddPartnersCountToProducts < ActiveRecord::Migration
  def change
    add_column :products, :partners_count, :integer

    Product.find_each do |p|
      p.update_partners_count_cache
      p.save!
    end
  end
end
