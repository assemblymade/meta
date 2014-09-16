class AddFlaggedAtToPosts < ActiveRecord::Migration
  def change
    add_column :posts, :flagged_at, :datetime
    add_index :posts, :flagged_at
    add_index :posts, [:product_id, :flagged_at]
  end
end
