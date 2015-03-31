class AddCoinInfo < ActiveRecord::Migration
  def change
    create_table :coin_infos, id: :uuid do |t|
      t.datetime :created_at,       null: false
      t.datetime :updated_at,       null: false
      t.string :asset_address
      t.string :contract_url
      t.string :name
      t.string :issuer
      t.string :description
      t.string :description_mime
      t.string :coin_type
      t.string :divisibility
      t.boolean :link_to_website
      t.string :icon_url
      t.string :image_url
      t.string :version
      t.string :asset_address
      t.uuid :product_id
    end

  end
end
