class CreateScreenshots < ActiveRecord::Migration
  def change
    create_table :screenshots, id: :uuid do |t|
      t.datetime :created_at,   null: false
      t.uuid     :asset_id,     null: false
      t.integer  :position,                 default: 0
    end

    add_foreign_key :screenshots, :assets
  end
end
