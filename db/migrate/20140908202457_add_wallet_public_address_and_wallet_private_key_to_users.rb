class AddWalletPublicAddressAndWalletPrivateKeyToUsers < ActiveRecord::Migration
  def change
    add_column :users, :wallet_public_address,             :string
    add_column :users, :encrypted_wallet_private_key,      :binary
    add_column :users, :encrypted_wallet_private_key_salt, :binary
    add_column :users, :encrypted_wallet_private_key_iv,   :binary
  end
end
