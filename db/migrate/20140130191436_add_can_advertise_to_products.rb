class AddCanAdvertiseToProducts < ActiveRecord::Migration
  def change
    add_column :products, :can_advertise, :bool, default: false
  end
end
