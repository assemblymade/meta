class AddDeletedAtToIdeas < ActiveRecord::Migration
  def change
    add_column :ideas, :deleted_at, :datetime
    add_index :ideas, :deleted_at
  end
end
