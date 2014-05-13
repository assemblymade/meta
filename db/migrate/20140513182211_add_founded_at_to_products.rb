class AddFoundedAtToProducts < ActiveRecord::Migration
  def change
    add_column :products, :founded_at, :datetime
  end
end
