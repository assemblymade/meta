class CreateOwnershipStatus < ActiveRecord::Migration
  def change
    create_table :ownership_statuses, id: :uuid do |t|
      t.uuid      :product_id
      t.string    :state
      t.string    :asset
      t.text      :description

      t.datetime  :pending_until
      t.datetime  :state_updated_at
      t.datetime  :owned_at

      t.timestamps
    end
    add_index :ownership_statuses, :product_id
  end
end
