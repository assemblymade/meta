class RemoveUniqueIndexOnUserName < ActiveRecord::Migration
  def change
    remove_index :users, :column => :name
    add_index :users, :name
  end
end
