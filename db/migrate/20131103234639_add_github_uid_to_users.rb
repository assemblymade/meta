class AddGithubUidToUsers < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.integer :github_uid
      t.string :github_login

      t.index :github_uid, unique: true
    end
  end
end
