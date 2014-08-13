class AddEventIndexes < ActiveRecord::Migration
  def change
    add_index :events, [:type, :wip_id]
  end
end
