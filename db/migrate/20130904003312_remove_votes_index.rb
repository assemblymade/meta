class RemoveVotesIndex < ActiveRecord::Migration
  def change
    remove_index :votes, [:user_id, :voteable_id]
  end
end
