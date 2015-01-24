class AddGreenlitAtToIdeas < ActiveRecord::Migration
  def up
    add_column :ideas, :greenlit_at, :datetime
  end

  def down
    remove_column :ideas, :greenlit_at
  end
end
