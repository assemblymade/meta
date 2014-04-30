class AddProductIdToProductRole < ActiveRecord::Migration
  def change
    add_column :product_roles, :product_id, :uuid, null: false
  end
end
