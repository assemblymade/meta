class AddClosedAtToWips < ActiveRecord::Migration
  def change
    change_table :wips do |t|
      t.uuid      :closer_id
      t.uuid      :winner_id
      t.datetime  :closed_at
    end
  end
end
