class TrackTweetStatusOnIdeas < ActiveRecord::Migration
  def change
    add_column :ideas, :last_tweeted_at, :datetime
  end
end
