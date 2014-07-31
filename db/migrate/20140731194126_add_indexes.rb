class AddIndexes < ActiveRecord::Migration
  def change
    add_index :events, :user_id
    add_index :events, :wip_id
    add_index :wips, :product_id
  end
end
