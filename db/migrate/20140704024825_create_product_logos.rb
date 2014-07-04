class CreateProductLogos < ActiveRecord::Migration
  def change
    create_table :product_logos, id: :uuid do |t|
      t.uuid :product_id,    null: false
      t.uuid :user_id,       null: false
      t.uuid :attachment_id, null:false

      t.timestamps
    end
  end
end
