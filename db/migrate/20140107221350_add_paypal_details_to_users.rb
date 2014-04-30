class AddPaypalDetailsToUsers < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.string :payment_option
      t.string :paypal_email
    end
  end
end
