class AddIndexToWatchingsForProducts < ActiveRecord::Migration
  def change
    add_index :watchings, [:unwatched_at, :user_id, :watchable_type]
  end
end
