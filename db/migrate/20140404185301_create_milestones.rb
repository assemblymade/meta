class CreateMilestones < ActiveRecord::Migration
  def change
    create_table :milestones, id: :uuid do |t|
      t.uuid :user_id,      null: false
      t.uuid :product_id,   null: false
      t.integer :number,    null: false
      t.text :title,        null: false
      t.text :description
      t.timestamps

      t.index [:product_id, :number], unique: true
    end
  end
end
