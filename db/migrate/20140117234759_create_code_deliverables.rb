class CreateCodeDeliverables < ActiveRecord::Migration
  def change
    create_table :code_deliverables, id: false do |t|
      t.primary_key :id, :uuid, default: nil
      t.uuid     :wip_id, null: false
      t.uuid     :user_id, null: false
      t.string   :url, null: false
      t.datetime :created_at
    end
  end
end
