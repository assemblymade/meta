class CreateShowcaseEntries < ActiveRecord::Migration
  def change
    create_table :showcase_entries, id: :uuid do |t|
      t.datetime :created_at,  null: false
      t.uuid     :showcase_id, null: false
      t.uuid     :product_id,  null: false
    end

    add_foreign_key :showcase_entries, :showcases
    add_foreign_key :showcase_entries, :products
  end
end
