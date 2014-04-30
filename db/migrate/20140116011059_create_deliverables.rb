class CreateDeliverables < ActiveRecord::Migration
  def change
    create_table :deliverables, id: false do |t|
      t.primary_key :id, :uuid, default: nil
      t.uuid :wip_id, null: false
      t.uuid :attachment_id, null: false
      t.datetime :created_at
    end
  end
end
