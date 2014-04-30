class UniqifyVotesAgain < ActiveRecord::Migration
  def change
    Vote.all.group_by{|v| [v.user_id, v.voteable_id] }.values.each do |dupes|
      dupes.shift
      dupes.each{|dupe| dupe.destroy}
    end

    add_index :votes, [:user_id, :voteable_id], unique: true
  end
end
