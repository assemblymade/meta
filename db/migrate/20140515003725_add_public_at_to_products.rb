class AddPublicAtToProducts < ActiveRecord::Migration
  def change
    add_column :products, :public_at, :datetime
  end
end
