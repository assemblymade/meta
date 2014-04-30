class AddAuthenticationTokenToUsers < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.string :authentication_token
      t.index :authentication_token, unique: true
    end
    User.find_each do |user|
      user.ensure_authentication_token!
    end
  end
end
