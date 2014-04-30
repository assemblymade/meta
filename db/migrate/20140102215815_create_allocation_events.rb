class CreateAllocationEvents < ActiveRecord::Migration
  def change
    create_table :allocation_events, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.uuid :allocation_run_id, null: false
      t.uuid :user_id,           null: false
      t.integer :score,          null: false
      t.decimal :stake,          precision: 8, scale: 6, null: false

      t.datetime :created_at, null: false
    end
  end
end
