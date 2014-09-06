class CreateAssemblyAssets < ActiveRecord::Migration
  def change
    create_table :assembly_assets, id: :uuid do |t|
      t.number :asset_id,   null: false
      t.uuid :user_id,    null: false
      t.uuid :product_id, null: false

      t.timestamps
    end
  end
end
