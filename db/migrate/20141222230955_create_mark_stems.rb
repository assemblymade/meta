class CreateMarkStems < ActiveRecord::Migration
  def change
    create_table :mark_stems, id: :uuid  do |t|
      t.string :name

      t.timestamps
    end
  end
end
