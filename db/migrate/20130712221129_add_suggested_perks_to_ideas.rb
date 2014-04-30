class AddSuggestedPerksToIdeas < ActiveRecord::Migration
  def change
    add_column :ideas, :suggested_perks, :text
  end
end
