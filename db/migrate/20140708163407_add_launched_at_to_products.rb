class AddLaunchedAtToProducts < ActiveRecord::Migration
  def change
    add_column :products, :launched_at, :datetime
  end
end
