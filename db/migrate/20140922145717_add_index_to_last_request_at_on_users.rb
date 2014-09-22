class AddIndexToLastRequestAtOnUsers < ActiveRecord::Migration
  def change
    add_index :users, :last_request_at
  end
end
