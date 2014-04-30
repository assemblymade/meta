class AddVotesRemainingToUsers < ActiveRecord::Migration
  def up
    add_column :users, :votes_remaining, :integer
    User.update_all(votes_remaining: 3)
    change_column :users, :votes_remaining, :integer, null: false
  end
end
