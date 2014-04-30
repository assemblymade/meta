class AddUsernameToUsers < ActiveRecord::Migration
  def change
    add_column :users, :username, :string

    User.find_each do |u|
      u.update_attributes username: u.name.downcase.gsub(' ', '').strip
    end

    change_column :users, :username, :string, null: false

    add_index :users, :username, unique: true
  end
end
