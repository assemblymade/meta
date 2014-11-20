class CreateHearts < ActiveRecord::Migration
  def change
    create_table :hearts, id: :uuid do |t|
      t.uuid   :user_id,          null: false
      t.uuid   :heartable_id,     null: false
      t.string :heartable_type,   null: false
      t.datetime :created_at,     null: false

      t.index [:user_id, :heartable_id], unique: true
    end
  end
end
