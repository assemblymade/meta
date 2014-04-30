class AddEmailConfirmableToUsers < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.datetime :confirmation_sent_at
      t.datetime :confirmed_at
      t.string   :confirmation_token
      t.string   :unconfirmed_email
      t.datetime :email_failed_at
    end
  end
end
