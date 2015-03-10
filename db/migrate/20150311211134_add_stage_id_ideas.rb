class AddStageIdIdeas < ActiveRecord::Migration
  def change
    add_column :ideas, :stage_id, :uuid
  end
end
