class CreateUniques < ActiveRecord::Migration
  def change
    create_table :uniques, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.uuid     :metric_id,    null: false
      t.string   :distinct_id,  null: false
      t.datetime :created_at,   null: false

      t.index [:distinct_id, :created_at]
    end
  end
end
