class AddCounterCachesForVotes < ActiveRecord::Migration
  def change
    add_column :features, :upvotes_count, :integer, null: false, default: 0
    add_column :ideas, :upvotes_count, :integer, null: false, default: 0
    add_column :wips, :upvotes_count, :integer, null: false, default: 0
  end
end
