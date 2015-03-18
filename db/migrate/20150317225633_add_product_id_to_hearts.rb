class AddProductIdToHearts < ActiveRecord::Migration
  def change
    add_column :hearts, :product_id, :uuid

    add_foreign_key :hearts, :products

    Heart.includes(:heartable).find_each do |h|
      if product = h.heartable.try(:product)
        h.update_column(:product_id, product.id)
      end
    end
  end
end
