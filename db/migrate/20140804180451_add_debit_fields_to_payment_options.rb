class AddDebitFieldsToPaymentOptions < ActiveRecord::Migration
  def change
    change_table :user_payment_options do |t|
      t.string :recipient_id
      t.string :last4
    end
  end
end
