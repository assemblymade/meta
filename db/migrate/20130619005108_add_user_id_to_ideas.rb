class AddUserIdToIdeas < ActiveRecord::Migration
  def change
    change_table :ideas do |t|
      t.uuid :user_id, null: false
    end
  end
end
