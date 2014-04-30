class AddBankDetailsToUsers < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.string :bank_account_id
      t.string :bank_name
      t.string :bank_last4
      t.string :address_line1
      t.string :address_line2
      t.string :address_city
      t.string :address_state
      t.string :address_zip
    end
  end
end
