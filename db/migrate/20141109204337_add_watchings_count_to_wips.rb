class AddWatchingsCountToWips < ActiveRecord::Migration
  def change
    add_column :wips, :watchings_count, :integer
  end
end
