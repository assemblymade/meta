class AddWatchingsIndex < ActiveRecord::Migration
  def change
    add_index :watchings, [:watchable_id, :watchable_type]
  end
end
