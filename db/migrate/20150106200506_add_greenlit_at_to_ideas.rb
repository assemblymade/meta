class AddGreenlitAtToIdeas < ActiveRecord::Migration
  def up
    add_column :ideas, :greenlit_at, :datetime

    Idea.find_each do |idea|
      idea.greenlight! if idea.should_greenlight?
    end
  end

  def down
    remove_column :ideas, :greenlit_at
  end
end
