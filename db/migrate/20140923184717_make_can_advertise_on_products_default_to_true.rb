class MakeCanAdvertiseOnProductsDefaultToTrue < ActiveRecord::Migration
  def change
    change_column :products, :can_advertise, :boolean, default: true
  end
end
