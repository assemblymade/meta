class AddCommentsCounterToWips < ActiveRecord::Migration
  def change
    add_column :wips, :comments_count, :integer, null: false, default: 0

    Wip.find_each do |i|
      Wip.reset_counters(i.id, :comments)
    end
  end
end
