class AddIndexToTopProducts < ActiveRecord::Migration
  def change
    add_index :top_products, :user_id
  end
end
