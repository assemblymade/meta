class AddTiltingThresholdToIdeas < ActiveRecord::Migration
  def change
    add_column :ideas, :tilting_threshold, :integer
  end
end
