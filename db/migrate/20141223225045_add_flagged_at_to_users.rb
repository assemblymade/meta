class AddFlaggedAtToUsers < ActiveRecord::Migration
  def change
    add_column :users, :flagged_at, :datetime
  end
end
