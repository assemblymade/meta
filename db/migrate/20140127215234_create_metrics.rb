class CreateMetrics < ActiveRecord::Migration
  def change
    create_table :metrics, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.uuid     :product_id, null: false
      t.string   :name,       null: false
    end
  end
end
