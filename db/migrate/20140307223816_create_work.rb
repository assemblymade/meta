class CreateWork < ActiveRecord::Migration
  def change
    create_table :work, id: :uuid do |t|
      t.uuid :product_id,     null: false
      t.uuid :user_id
      t.text :url,            null: false
      t.json :metadata,       null: false
      t.timestamps
    end
  end
end
