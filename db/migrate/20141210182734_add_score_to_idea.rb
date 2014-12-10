class AddScoreToIdea < ActiveRecord::Migration
  def change
    add_column :ideas, :score, :float, default: 0
    add_column :ideas, :last_score_update, :datetime, default: DateTime.new(2013,6,6)
  end
end
