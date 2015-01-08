class AddGreenlitAtToIdeas < ActiveRecord::Migration
  def change
    add_column :ideas, :greenlit_at, :datetime
  end
end
