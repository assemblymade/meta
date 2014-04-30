class CreateShowcases < ActiveRecord::Migration
  def change
    create_table :showcases, id: false do |t|
      t.primary_key :id, :uuid, default: nil
      t.uuid :product_id
      t.uuid :wip_id
      t.datetime :showcased_at
      t.timestamps
    end
  end
end
