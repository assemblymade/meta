class RemoveVotesRemainingFromUsers < ActiveRecord::Migration

  def change
    remove_column :users, :votes_remaining
  end

end
