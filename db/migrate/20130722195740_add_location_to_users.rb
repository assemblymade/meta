class AddLocationToUsers < ActiveRecord::Migration
  def change
    add_column :users, :location, :text
  end
end
