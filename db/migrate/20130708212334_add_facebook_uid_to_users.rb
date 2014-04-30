class AddFacebookUidToUsers < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.string :users, :facebook_uid
      t.change :encrypted_password, :string, null: true
    end

    add_index :users, :facebook_uid, unique: true
  end
end
