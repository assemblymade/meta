class AddPinnedAtToWips < ActiveRecord::Migration
  def change
    add_column :wips, :pinned_at, :datetime
  end
end
