class ChangePotentialUsersToSubscribers < ActiveRecord::Migration
  def change
    rename_table :potential_users, :subscribers

    change_table :subscribers do |t|
      t.uuid :user_id
    end
  end
end
