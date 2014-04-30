class CreateProductStatuses < ActiveRecord::Migration
  def change
    create_table :status_updates, id: false do |t|
      t.primary_key :id, :uuid,   default: nil

      t.uuid :product_id, null: false
      t.uuid :user_id,    null: false
      t.text :body,       null: false

      t.timestamps
    end
  end
end
