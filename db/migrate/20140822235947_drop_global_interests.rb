class DropGlobalInterests < ActiveRecord::Migration
  def change
    drop_table :global_interests do |t|
    end
  end
end
