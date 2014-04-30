class AddUserToPresale < ActiveRecord::Migration
  def change
    add_column :presales, :user_id, :uuid, null: false
  end
end
