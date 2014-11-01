class CreateIntegrations < ActiveRecord::Migration
  def change
    create_table :integrations, id: :uuid do |t|
      t.uuid   :product_id,   null: false
      t.string :access_token, null: false
      t.string :refresh_token
      t.string :token_type
      t.string :provider,      null: false
      t.timestamps
    end
  end
end
