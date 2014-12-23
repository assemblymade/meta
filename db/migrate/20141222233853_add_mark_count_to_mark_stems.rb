class AddMarkCountToMarkStems < ActiveRecord::Migration
  def change
    add_column :mark_stems, :marks_count, :integer, default: 0
  end
end
