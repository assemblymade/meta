class AddInfoToProducts < ActiveRecord::Migration
  def change
    add_column :products, :info, :hstore
  end
end
