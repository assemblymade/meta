class CreateMilestoneTasks < ActiveRecord::Migration
  def change
    create_table :milestone_tasks, id: :uuid do |t|
      t.uuid :milestone_id,   null: false
      t.uuid :task_id,        null: false
      t.datetime :created_at
    end
  end
end
