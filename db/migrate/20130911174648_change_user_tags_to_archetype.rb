class ChangeUserTagsToArchetype < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.remove :tags
      t.string :archetype
    end
  end
end
