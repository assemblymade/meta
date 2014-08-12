class CreateOffers < ActiveRecord::Migration
  def change
    create_table :offers, id: :uuid do |t|
      t.uuid      :bounty_id,  null: false
      t.uuid      :user_id,    null: false
      t.integer   :amount,     null: false
      t.inet      :ip,         null: false
      t.datetime  :created_at, null: false
    end
  end
end
