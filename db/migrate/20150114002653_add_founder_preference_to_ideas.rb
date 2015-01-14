class AddFounderPreferenceToIdeas < ActiveRecord::Migration
  def change
    add_column :ideas, :founder_preference, :boolean
  end
end
