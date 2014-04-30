class AddTrendingScoreToWips < ActiveRecord::Migration
  def change
    add_column :wips, :trending_score, :bigint
  end
end
