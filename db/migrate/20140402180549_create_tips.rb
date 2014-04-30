class CreateTips < ActiveRecord::Migration
  def change
    create_table :tips, id: :uuid do |t|
      t.uuid :product_id, null: false
      t.uuid :from_id,    null: false
      t.uuid :to_id,      null: false
      t.uuid :via_id,     null: false
      t.integer :cents,   null: false
      t.timestamps

      t.index [:product_id, :from_id, :to_id, :via_id], unique: true
    end
  end
end
