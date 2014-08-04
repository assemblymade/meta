class CreateUserPaymentOptions < ActiveRecord::Migration
  def change
    create_table :user_payment_options, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.string :type, null: false
      t.string :bitcoin_address
    end
  end
end
