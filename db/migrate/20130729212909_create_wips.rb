class CreateWips < ActiveRecord::Migration
  def change
    create_table :wips, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.uuid :user_id,    null: false
      t.uuid :product_id, null: false
      t.text :title,      null: false
      t.text :body
      t.timestamps
    end
  end
end
