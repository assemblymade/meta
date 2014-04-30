class AddSendDigestsToUsers < ActiveRecord::Migration
  def change
    add_column :users, :send_digests, :bool, null: false, default: true
  end
end
