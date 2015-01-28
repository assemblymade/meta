class AddDeletedAtToWips < ActiveRecord::Migration
  def change
    add_column :wips, :deleted_at, :datetime
    add_index :wips, :deleted_at
  end
end
