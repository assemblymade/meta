class CreateProductEmailSubscriptions < ActiveRecord::Migration
  def change
    create_table :product_email_subscriptions do |t|
      t.datetime :created_at,   null: false
      t.string :email,          null: false
      t.uuid :product_id,       null: false
    end
  end
end
