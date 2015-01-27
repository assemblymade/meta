class AddFlaggedAtToIdeas < ActiveRecord::Migration
  def change
    add_column :ideas, :flagged_at, :datetime
    add_index :ideas, :flagged_at
  end
end
