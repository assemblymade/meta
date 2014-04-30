class AddTwitterColumnsToUsers < ActiveRecord::Migration
  def change
    add_column :users, :twitter_uid, :text
    add_column :users, :twitter_nickname, :text
  end
end
