class CreateMeasurement < ActiveRecord::Migration
  def change
    create_table :measurements, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.uuid     :metric_id,  null: false
      t.decimal  :value,      null: false
      t.datetime :created_at, null: false
    end
  end
end
