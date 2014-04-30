class MergeMilestonesWithWips < ActiveRecord::Migration
  def change
    Milestone.destroy_all
    change_table :milestones do |t|
      t.remove :title
      t.uuid :wip_id, null: false
    end
  end
end
