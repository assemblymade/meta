class AddOrderToBounties < ActiveRecord::Migration
  def change
    add_column :wips, :display_order, :integer
  end
end
