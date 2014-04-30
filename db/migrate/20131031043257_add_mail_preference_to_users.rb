class AddMailPreferenceToUsers < ActiveRecord::Migration
  def change
    remove_column :users, :send_digests
    add_column :users, :mail_preference, :string, null: false, default: 'daily'
  end
end
