class CreatePotentialUsers < ActiveRecord::Migration
  def change
    create_table :potential_users, id: :uuid do |t|
      t.datetime :created_at, null: false
      t.string :email,        null: false
      t.uuid :product_id,     null: false
    end
  end
end
