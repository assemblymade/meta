class AddImagesCountToMilestones < ActiveRecord::Migration
  def change
    add_column :milestones, :milestone_images_count, :integer, null: false, default: 0

    Milestone.find_each do |o|
      Milestone.reset_counters(o.id, :milestone_images)
    end
  end
end
