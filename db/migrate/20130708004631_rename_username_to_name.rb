class RenameUsernameToName < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.rename :username, :name
    end
  end
end
