class AddIdeaIdToChecklistitem < ActiveRecord::Migration
  def change
    add_column :checklist_items, :idea_id, :uuid
  end
end
