class CreateOffers < ActiveRecord::Migration
  def change
    create_table :offers, id: :uuid do |t|
      t.uuid :bounty_id, null: false
      t.uuid :user_id, null: false
      t.integer :amount, null: false, default: 0
      t.datetime :created_at
    end
  end
end
