class CreateCompletedMissions < ActiveRecord::Migration
  def change
    create_table :completed_missions, id: false do |t|
      t.primary_key :id, :uuid, default: nil
      t.uuid :product_id,      null: false
      t.string :mission_id,    null: false
      t.datetime :created_at,  null: false
    end
  end
end
