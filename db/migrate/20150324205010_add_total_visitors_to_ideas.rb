class AddTotalVisitorsToIdeas < ActiveRecord::Migration
  def change
    add_column :ideas, :total_visitors, :integer, null: false, default: 0
  end
end
