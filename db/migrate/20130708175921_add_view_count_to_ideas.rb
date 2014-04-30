class AddViewCountToIdeas < ActiveRecord::Migration
  def change
    change_table :ideas do |t|
      t.integer :view_count, default: 0
    end
  end
end
