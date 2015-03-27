class DropOrphanTables < ActiveRecord::Migration
  def change
    drop_table :stages
    drop_table :checklist_items
    drop_table :checklist_types
  end
end
