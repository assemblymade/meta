class AddAuthenticationTokenToProducts < ActiveRecord::Migration
  def change
    add_column :products, :authentication_token, :string
  end
end
