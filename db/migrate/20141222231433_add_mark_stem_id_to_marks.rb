class AddMarkStemIdToMarks < ActiveRecord::Migration
  def change
    add_column :marks, :mark_stem_id, :uuid 
    add_index :marks, :mark_stem_id
  end
end
