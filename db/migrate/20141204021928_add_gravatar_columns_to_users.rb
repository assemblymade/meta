class AddGravatarColumnsToUsers < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.datetime :gravatar_checked_at
      t.datetime :gravatar_verified_at

      t.index :gravatar_checked_at
      t.index :gravatar_verified_at
    end
  end
end
