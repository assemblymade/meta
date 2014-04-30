class AddUniqueIndexToAuthenticationTokenOnProducts < ActiveRecord::Migration
  def change
    add_index :products, :authentication_token, unique: true
  end
end
