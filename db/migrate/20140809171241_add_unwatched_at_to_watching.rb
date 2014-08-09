class AddUnwatchedAtToWatching < ActiveRecord::Migration
  def change
    add_column :watchings, :unwatched_at, :datetime
  end
end
