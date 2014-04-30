class CreateStatusMessages < ActiveRecord::Migration
  def change
    create_table :status_messages, id: false do |t|
      t.primary_key :id, :uuid, default: nil
      t.uuid :product_id,       null: false
      t.uuid :user_id,          null: false
      t.string :body,           null: false
      t.datetime :created_at,   null: false
    end
  end
end
