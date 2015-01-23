class AddCategoriesToIdeas < ActiveRecord::Migration
  def change
    add_column :ideas, :categories, :text, array: true, default: []
  end
end
