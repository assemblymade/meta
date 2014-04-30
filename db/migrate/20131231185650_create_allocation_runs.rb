class CreateAllocationRuns < ActiveRecord::Migration
  def change
    create_table :allocation_runs, id: false do |t|
      t.primary_key :id, :uuid, default: nil
      t.uuid :product_id, null: false
      t.datetime :created_at, null: false
      t.hstore :parameters
    end
  end
end
