class CreateSubscriptions < ActiveRecord::Migration
  def change
    create_table :product_subscriptions, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.uuid :product_id, null: false
      t.uuid :user_id, null: false

      t.datetime :created_at
    end

    add_index :product_subscriptions, [:product_id, :user_id], unique: true
  end
end
