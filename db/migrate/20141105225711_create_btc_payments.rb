class CreateBtcPayments < ActiveRecord::Migration
  def change
    create_table :btc_payments do |t|
      t.integer :btcusdprice_at_moment  #in cents
      t.datetime :created_at
      t.string :action
      t.string :sender
      t.string :sender_address
      t.string :recipient
      t.string :recipient_address
      t.integer :btc_change, :limit =>8 #in satoshi, 10^8 per BTC
    end
  end
end
