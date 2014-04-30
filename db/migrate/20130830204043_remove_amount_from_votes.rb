class RemoveAmountFromVotes < ActiveRecord::Migration
  def change
    remove_column :votes, :amount
  end
end
