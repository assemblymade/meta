class Addchecklisttypetoitem < ActiveRecord::Migration
  def change
    add_column :checklist_items, :checklist_type_id, :uuid
  end
end
