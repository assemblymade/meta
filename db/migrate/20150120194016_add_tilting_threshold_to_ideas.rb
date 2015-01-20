class AddTiltingThresholdToIdeas < ActiveRecord::Migration
  def up
    add_column :ideas, :tilting_threshold, :integer

    Idea.find_each do |idea|
      idea.set_tilting_threshold!
    end
  end

  def down
    remove_column :ideas, :tilting_threshold
  end
end
