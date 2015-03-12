class AddIdeaIdToChecklistitem < ActiveRecord::Migration
  def change
    add_column :checklist_items, :idea_id, :uuid
    add_column :stages, :order, :integer
  end
end
