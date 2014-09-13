class AddWalletPublicAddressAndWalletPrivateKeyToProducts < ActiveRecord::Migration
  def change
    add_column :products, :wallet_public_address,             :string
    add_column :products, :encrypted_wallet_private_key,      :binary
    add_column :products, :encrypted_wallet_private_key_salt, :binary
    add_column :products, :encrypted_wallet_private_key_iv,   :binary
  end
end
