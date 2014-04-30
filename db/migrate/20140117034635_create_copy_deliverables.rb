class CreateCopyDeliverables < ActiveRecord::Migration
  def change
    create_table :copy_deliverables, id: false do |t|
      t.primary_key :id, :uuid, default: nil
      t.uuid     :wip_id, null: false
      t.uuid     :user_id, null: false
      t.text   :body, null: false
      t.datetime :created_at
    end
  end
end
