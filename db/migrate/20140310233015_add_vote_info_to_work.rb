class AddVoteInfoToWork < ActiveRecord::Migration
  def change
    add_column :work, :votes_count, :integer, null: false, default: 0

  end
end
