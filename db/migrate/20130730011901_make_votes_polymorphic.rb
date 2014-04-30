class MakeVotesPolymorphic < ActiveRecord::Migration
  def change
    rename_column :votes, :idea_id, :voteable_id
    add_column :votes, :voteable_type, :string, :default => 'Idea'
  end
end
