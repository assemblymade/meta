class CreateVestings < ActiveRecord::Migration
  def change
    create_table :vestings, id: :uuid do |t|
      t.uuid :proposal_id
      t.datetime :start_date
      t.datetime :expiration_date
      t.integer :intervals
      t.integer :intervals_paid
      t.integer :coins
      t.uuid :user_id
      t.string :state
      t.uuid :product_id
      t.timestamps null: false
    end
  end
end
