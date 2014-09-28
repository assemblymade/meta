class AddFlaggedAtToWips < ActiveRecord::Migration
  def change
    change_table :wips do |t|
      t.datetime :flagged_at
      t.uuid :flagged_by_id

      t.index :flagged_at
    end
  end
end
