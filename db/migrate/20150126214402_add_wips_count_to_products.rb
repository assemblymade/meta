class AddWipsCountToProducts < ActiveRecord::Migration
  def change
    add_column :products, :wips_count, :integer, null: false, default: 0

    Product.reset_column_information

    wip_counts = Wip.group(:product_id).count

    begin
      Product.update(wip_counts.keys, wip_counts.values.map{ |count| { wips_count: count } })
    rescue ActiveRecord::RecordNotFound
    end
  end
end
