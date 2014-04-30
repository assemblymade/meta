class CreateWipWorkers < ActiveRecord::Migration
  def change
    create_table :wip_workers, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.uuid :wip_id, null: false
      t.uuid :user_id, null: false

      t.datetime :created_at

      t.index [:wip_id, :user_id], unique: true
    end
  end
end
