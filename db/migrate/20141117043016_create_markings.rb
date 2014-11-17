class CreateMarkings < ActiveRecord::Migration
  def change
    create_table :markings, id: :uuid do |t|
      t.string :markable_type
      t.uuid :markable_id
      t.uuid :mark_id
      t.float :weight
      t.timestamps
    end
  end
end
