class RenameUpvoteCounterCaches < ActiveRecord::Migration
  def change
    rename_column :features, :upvotes_count, :votes_count
    rename_column :ideas, :upvotes_count, :votes_count
    rename_column :wips, :upvotes_count, :votes_count
  end
end
