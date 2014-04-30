class AddUniqueIndexToMilestoneTasks < ActiveRecord::Migration
  def change
    add_index :milestone_tasks, [:milestone_id, :task_id], unique: true
  end
end
