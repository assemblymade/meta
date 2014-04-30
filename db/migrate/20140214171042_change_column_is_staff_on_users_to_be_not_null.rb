class ChangeColumnIsStaffOnUsersToBeNotNull < ActiveRecord::Migration
  def change
    change_column :users, :is_staff, :boolean, null: false, default: false
  end
end
