class AddAddressCountryToUsers < ActiveRecord::Migration
  def change
    add_column :users, :address_country, :string
  end
end
