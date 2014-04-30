class AddGreenlitAtToProducts < ActiveRecord::Migration
  def change
    add_column :products, :greenlit_at, :datetime
  end
end
